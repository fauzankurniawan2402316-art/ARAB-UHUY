import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { VideoLesson, UserProgress, UserNote } from '../types';
import { DEFAULT_VIDEOS } from '../data/defaultVideos';

interface DataContextType {
  videos: VideoLesson[];
  userProgress: Record<string, UserProgress>;
  userNotes: UserNote[];
  bookmarks: string[];
  activeVideo: VideoLesson | null;
  setActiveVideo: (video: VideoLesson | null) => void;
  addVideo: (video: Omit<VideoLesson, 'id' | 'createdAt'>) => Promise<string>;
  updateVideo: (video: VideoLesson) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  saveProgress: (
    videoId: string,
    completed: boolean,
    quizCompleted: boolean,
    quizScore: number,
    totalQuestions: number,
    lastWatchedSeconds: number
  ) => Promise<void>;
  saveNote: (
    videoId: string,
    videoTitle: string,
    content: string,
    timestampSeconds?: number,
    timestampText?: string
  ) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  toggleBookmark: (videoId: string) => void;
  isBookmarked: (videoId: string) => boolean;
  refreshVideos: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const BOOKMARKS_STORAGE_PREFIX = 'maharah_bookmarks_';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isAdmin } = useAuth();
  const [videos, setVideos] = useState<VideoLesson[]>(DEFAULT_VIDEOS);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(DEFAULT_VIDEOS[0]);

  // Load bookmarks from local storage per user
  useEffect(() => {
    if (userProfile?.userId) {
      const stored = localStorage.getItem(`${BOOKMARKS_STORAGE_PREFIX}${userProfile.userId}`);
      if (stored) {
        try {
          setBookmarks(JSON.parse(stored));
        } catch {
          setBookmarks([]);
        }
      } else {
        setBookmarks([]);
      }
    }
  }, [userProfile?.userId]);

  const toggleBookmark = (videoId: string) => {
    if (!userProfile?.userId) return;
    setBookmarks((prev) => {
      const updated = prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId];
      localStorage.setItem(`${BOOKMARKS_STORAGE_PREFIX}${userProfile.userId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (videoId: string) => bookmarks.includes(videoId);

  // Fetch or sync videos from Firestore
  const loadVideosFromFirestore = async () => {
    try {
      const snap = await getDocs(collection(db, 'videos'));
      if (!snap.empty) {
        const firestoreVideos: VideoLesson[] = [];
        snap.forEach((d) => {
          firestoreVideos.push({ id: d.id, ...(d.data() as any) });
        });
        // Merge with default videos to guarantee high content richness
        const idSet = new Set(firestoreVideos.map((v) => v.id));
        const combined = [...firestoreVideos];
        DEFAULT_VIDEOS.forEach((dv) => {
          if (!idSet.has(dv.id)) {
            combined.push(dv);
          }
        });
        setVideos(combined);
      } else {
        setVideos(DEFAULT_VIDEOS);
      }
    } catch (err) {
      console.warn('Could not read videos from Firestore (using built-in catalog):', err);
      setVideos(DEFAULT_VIDEOS);
    }
  };

  useEffect(() => {
    loadVideosFromFirestore();
  }, []);

  // Listen to User Progress & Notes if logged in
  useEffect(() => {
    if (!userProfile?.userId) {
      setUserProgress({});
      setUserNotes([]);
      return;
    }

    const userId = userProfile.userId;

    // For admin mock user 'admin-fauzankrn', store progress in localStorage to avoid permission denials
    if (userId === 'admin-fauzankrn') {
      const localProg = localStorage.getItem('admin_progress_cache');
      const localNotes = localStorage.getItem('admin_notes_cache');
      if (localProg) setUserProgress(JSON.parse(localProg));
      if (localNotes) setUserNotes(JSON.parse(localNotes));
      return;
    }

    // Listen to /users/{userId}/progress
    const progressCol = collection(db, 'users', userId, 'progress');
    const unsubscribeProgress = onSnapshot(
      progressCol,
      (snapshot) => {
        const progressMap: Record<string, UserProgress> = {};
        snapshot.forEach((docSnap) => {
          progressMap[docSnap.id] = docSnap.data() as UserProgress;
        });
        setUserProgress(progressMap);
      },
      (error) => {
        console.warn('Error reading user progress:', error);
      }
    );

    // Listen to /users/{userId}/notes
    const notesCol = collection(db, 'users', userId, 'notes');
    const unsubscribeNotes = onSnapshot(
      notesCol,
      (snapshot) => {
        const notesList: UserNote[] = [];
        snapshot.forEach((docSnap) => {
          notesList.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        // Sort newest first
        notesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserNotes(notesList);
      },
      (error) => {
        console.warn('Error reading user notes:', error);
      }
    );

    return () => {
      unsubscribeProgress();
      unsubscribeNotes();
    };
  }, [userProfile?.userId]);

  // Save Progress
  const saveProgress = async (
    videoId: string,
    completed: boolean,
    quizCompleted: boolean,
    quizScore: number,
    totalQuestions: number,
    lastWatchedSeconds: number
  ) => {
    if (!userProfile?.userId) return;

    const progressData: UserProgress = {
      videoId,
      completed,
      quizCompleted,
      quizScore,
      totalQuestions,
      lastWatchedSeconds,
      updatedAt: new Date().toISOString(),
    };

    if (userProfile.userId === 'admin-fauzankrn') {
      setUserProgress((prev) => {
        const updated = { ...prev, [videoId]: progressData };
        localStorage.setItem('admin_progress_cache', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const docRef = doc(db, 'users', userProfile.userId, 'progress', videoId);
      await setDoc(docRef, progressData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userProfile.userId}/progress/${videoId}`);
    }
  };

  // Save Note
  const saveNote = async (
    videoId: string,
    videoTitle: string,
    content: string,
    timestampSeconds?: number,
    timestampText?: string
  ) => {
    if (!userProfile?.userId) return;

    const noteId = `note-${Date.now()}`;
    const newNote: UserNote = {
      id: noteId,
      videoId,
      videoTitle,
      content,
      timestampSeconds,
      timestampText,
      createdAt: new Date().toISOString(),
    };

    if (userProfile.userId === 'admin-fauzankrn') {
      setUserNotes((prev) => {
        const updated = [newNote, ...prev];
        localStorage.setItem('admin_notes_cache', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const docRef = doc(db, 'users', userProfile.userId, 'notes', noteId);
      await setDoc(docRef, newNote);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userProfile.userId}/notes/${noteId}`);
    }
  };

  // Delete Note
  const deleteNote = async (noteId: string) => {
    if (!userProfile?.userId) return;

    if (userProfile.userId === 'admin-fauzankrn') {
      setUserNotes((prev) => {
        const updated = prev.filter((n) => n.id !== noteId);
        localStorage.setItem('admin_notes_cache', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const docRef = doc(db, 'users', userProfile.userId, 'notes', noteId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userProfile.userId}/notes/${noteId}`);
    }
  };

  // Admin: Add Video
  const addVideo = async (videoData: Omit<VideoLesson, 'id' | 'createdAt'>): Promise<string> => {
    const newId = `vid-${Date.now()}`;
    const newVideo: VideoLesson = {
      ...videoData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    // Update in-memory state immediately
    setVideos((prev) => [newVideo, ...prev]);

    // Save to Firestore if admin
    if (isAdmin) {
      try {
        const docRef = doc(db, 'videos', newId);
        await setDoc(docRef, newVideo);
      } catch (err) {
        console.warn('Could not write to Firestore videos collection:', err);
      }
    }

    return newId;
  };

  // Admin: Update Video
  const updateVideo = async (updated: VideoLesson) => {
    setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    if (activeVideo?.id === updated.id) {
      setActiveVideo(updated);
    }

    if (isAdmin) {
      try {
        const docRef = doc(db, 'videos', updated.id);
        await setDoc(docRef, updated, { merge: true });
      } catch (err) {
        console.warn('Could not update Firestore video:', err);
      }
    }
  };

  // Admin: Delete Video
  const deleteVideo = async (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    if (activeVideo?.id === videoId) {
      setActiveVideo(videos.find((v) => v.id !== videoId) || null);
    }

    if (isAdmin) {
      try {
        const docRef = doc(db, 'videos', videoId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Could not delete video from Firestore:', err);
      }
    }
  };

  return (
    <DataContext.Provider
      value={{
        videos,
        userProgress,
        userNotes,
        bookmarks,
        activeVideo,
        setActiveVideo,
        addVideo,
        updateVideo,
        deleteVideo,
        saveProgress,
        saveNote,
        deleteNote,
        toggleBookmark,
        isBookmarked,
        refreshVideos: loadVideosFromFirestore,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
