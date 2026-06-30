import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TastingEntry, RankingRecord, TastingParty, TastingReview } from '../types';
import { DEFAULT_TASTINGS, DEFAULT_RANKINGS, DEFAULT_PARTIES } from '../data/defaultData';

export function useFirestore() {
  const [entries, setEntries] = useState<TastingEntry[]>([]);
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [parties, setParties] = useState<TastingParty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Tasting Entries
    const entriesRef = collection(db, 'tasting_entries');
    const unsubEntries = onSnapshot(entriesRef, (snapshot) => {
      if (snapshot.empty) {
        // Initialize with default tastings in background
        DEFAULT_TASTINGS.forEach(async (item) => {
          await setDoc(doc(db, 'tasting_entries', item.id), item);
        });
      } else {
        const list: TastingEntry[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as TastingEntry);
        });
        setEntries(list);
      }
    });

    // 2. Rankings
    const rankingsRef = collection(db, 'tasting_rankings');
    const unsubRankings = onSnapshot(rankingsRef, (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_RANKINGS.forEach(async (item) => {
          await setDoc(doc(db, 'tasting_rankings', item.id), item);
        });
      } else {
        const list: RankingRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as RankingRecord);
        });
        list.sort((a, b) => b.date.localeCompare(a.date));
        setRankings(list);
      }
    });

    // 3. Parties
    const partiesRef = collection(db, 'tasting_parties');
    const unsubParties = onSnapshot(partiesRef, (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_PARTIES.forEach(async (item) => {
          await setDoc(doc(db, 'tasting_parties', item.id), item);
        });
      } else {
        const list: TastingParty[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as TastingParty);
        });
        list.sort((a, b) => b.date.localeCompare(a.date));
        setParties(list);
      }
      setIsLoading(false);
    });

    return () => {
      unsubEntries();
      unsubRankings();
      unsubParties();
    };
  }, []);

  const addLiquor = async (entry: TastingEntry) => {
    await setDoc(doc(db, 'tasting_entries', entry.id), entry);
  };

  const updateLiquor = async (entry: TastingEntry) => {
    await setDoc(doc(db, 'tasting_entries', entry.id), entry);
  };

  const deleteLiquor = async (id: string) => {
    await deleteDoc(doc(db, 'tasting_entries', id));
  };

  const addReview = async (liquorId: string, review: TastingReview) => {
    const entry = entries.find(e => e.id === liquorId);
    if (entry) {
      const updatedReviews = [review, ...entry.reviews];
      await updateDoc(doc(db, 'tasting_entries', liquorId), { reviews: updatedReviews });
    }
  };

  const deleteReview = async (liquorId: string, reviewId: string) => {
    const entry = entries.find(e => e.id === liquorId);
    if (entry) {
      const updatedReviews = entry.reviews.filter(r => r.id !== reviewId);
      await updateDoc(doc(db, 'tasting_entries', liquorId), { reviews: updatedReviews });
    }
  };

  const addRankingRecord = async (record: RankingRecord) => {
    await setDoc(doc(db, 'tasting_rankings', record.id), record);
  };

  const deleteRankingRecord = async (id: string) => {
    await deleteDoc(doc(db, 'tasting_rankings', id));
  };

  const addParty = async (party: TastingParty) => {
    await setDoc(doc(db, 'tasting_parties', party.id), party);
  };

  const deleteParty = async (id: string) => {
    await deleteDoc(doc(db, 'tasting_parties', id));
  };

  return {
    entries,
    rankingRecords: rankings,
    parties,
    isLoading,
    addLiquor,
    updateLiquor,
    deleteLiquor,
    addReview,
    deleteReview,
    addRankingRecord,
    deleteRankingRecord,
    addParty,
    deleteParty
  };
}
