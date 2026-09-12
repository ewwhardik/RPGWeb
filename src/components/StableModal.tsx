"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  PawPrint,
  Sparkles,
  Coins,
  Check,
  Loader2,
} from "lucide-react";
import { PET_SPECIES, HATCHING_POTIONS } from "@/lib/taskEngine";
import { soundFx } from "@/lib/audio";

interface UserPetItem {
  id: string;
  species: string;
  potionType: string;
  feedCount: number;
  isMount: boolean;
}

interface StableModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGold: number;
  currentPet: string | null;
  currentMount?: string | null;
  onPetEquipped: (petKey: string | null) => void;
  onGoldUpdated: (newGold: number) => void;
}

export default function StableModal({
  isOpen,
  onClose,
  userGold,
  currentPet,
  onPetEquipped,
  onGoldUpdated,
}: StableModalProps) {
  const [pets, setPets] = useState<UserPetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"PETS" | "HATCH">("PETS");
  const [selectedSpecies, setSelectedSpecies] = useState("Wolf");
  const [selectedPotion, setSelectedPotion] = useState("Base");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchStable = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stable");
      const data = await res.json();
      if (data.pets) {
        setPets(data.pets);
      }
    } catch {
      setStatusMessage("Failed to fetch stable companions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStable();
    }
  }, [isOpen, fetchStable]);

  if (!isOpen) return null;

  const handleFeed = async (pet: UserPetItem) => {
    if (userGold < 5 || actionLoadingId) return;

    try {
      setActionLoadingId(pet.id);
      soundFx.play("streak");

      const res = await fetch("/api/stable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "FEED", petId: pet.id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(data.message);
        onGoldUpdated(data.remainingGold);
        setPets((prev) =>
          prev.map((p) => (p.id === pet.id ? data.pet : p))
        );
      } else {
        setStatusMessage(data.error || "Failed to feed pet.");
      }
    } catch {
      setStatusMessage("Feeding failed due to unruly creature.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEquipPet = async (pet: UserPetItem) => {
    const petKey = `${pet.species}-${pet.potionType}`;
    const newEquipped = currentPet === petKey ? null : petKey;

    try {
      soundFx.play("click");
      const res = await fetch("/api/stable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EQUIP_PET",
          species: newEquipped ? pet.species : null,
          potionType: newEquipped ? pet.potionType : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onPetEquipped(newEquipped);
        setStatusMessage(data.message);
      }
    } catch {
      setStatusMessage("Failed to adjust companion leash.");
    }
  };

  const handleHatch = async () => {
    try {
      soundFx.play("complete");
      const res = await fetch("/api/stable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "HATCH",
          species: selectedSpecies,
          potionType: selectedPotion,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(data.message);
        await fetchStable();
        setActiveTab("PETS");
      } else {
        setStatusMessage(data.error || "Hatching failed.");
      }
    } catch {
      setStatusMessage("Arcane incubator misfired.");
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1a1f26] border border-[#333b47] rounded-xl w-full max-w-2xl shadow-2xl p-6 relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-emerald-400" />
            <span className="text-lg font-bold text-stone-100">
              Companion & Mount Stable
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 border border-amber-600/40 text-amber-300 font-bold text-xs">
              <Coins className="w-3.5 h-3.5" />
              <span>{userGold} Gold</span>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-stone-800 pb-3 mb-4">
          <button
            onClick={() => setActiveTab("PETS")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === "PETS"
                ? "bg-amber-500 border-amber-400 text-stone-950 shadow-sm"
                : "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
            }`}
          >
            My Companions ({pets.length})
          </button>
          <button
            onClick={() => setActiveTab("HATCH")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === "HATCH"
                ? "bg-amber-500 border-amber-400 text-stone-950 shadow-sm"
                : "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
            }`}
          >
            Hatchery Station
          </button>
        </div>

        {statusMessage && (
          <div className="mb-4 text-xs font-semibold text-amber-300 bg-amber-950/50 border border-amber-700/50 rounded-lg p-2.5 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-stone-400 hover:text-stone-200 text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: MY PETS */}
        {activeTab === "PETS" && (
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 flex items-center justify-center gap-2 text-stone-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Checking stable stalls...</span>
              </div>
            ) : pets.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-800 rounded-lg">
                No companions hatched yet. Visit the Hatchery Station to incubate an egg!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {pets.map((pet) => {
                  const petKey = `${pet.species}-${pet.potionType}`;
                  const isEquipped = currentPet === petKey;
                  const speciesMeta = PET_SPECIES.find((s) => s.id === pet.species);
                  const feedProgress = Math.min(100, (pet.feedCount / 50) * 100);

                  return (
                    <div
                      key={pet.id}
                      className={`border rounded-xl p-3 bg-[#212730] transition-all flex flex-col justify-between gap-2.5 ${
                        isEquipped
                          ? "border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                          : "border-stone-700 hover:border-amber-500/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-2xl">
                            {speciesMeta?.icon || "🐾"}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-100">
                              {pet.potionType} {speciesMeta?.name || pet.species}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {pet.isMount ? "Legendary Mount" : "Loyal Companion"}
                            </div>
                          </div>
                        </div>

                        {isEquipped && (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Equipped
                          </span>
                        )}
                      </div>

                      {/* Mount evolution bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-stone-400">
                          <span>Mount Maturity</span>
                          <span>{pet.feedCount} / 50</span>
                        </div>
                        <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all"
                            style={{ width: `${feedProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-800/80">
                        <button
                          onClick={() => handleFeed(pet)}
                          disabled={userGold < 5 || actionLoadingId === pet.id}
                          className="flex-1 py-1 px-2 rounded-md bg-stone-900 hover:bg-stone-800 border border-amber-600/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-40"
                          title="Feed 5 Gold Treat to advance mount growth"
                        >
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span>Feed (5g)</span>
                        </button>

                        <button
                          onClick={() => handleEquipPet(pet)}
                          className={`flex-1 py-1 px-2 rounded-md text-xs font-bold transition-all border ${
                            isEquipped
                              ? "bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700"
                              : "bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/50 text-emerald-300"
                          }`}
                        >
                          {isEquipped ? "Unequip" : "Equip"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HATCHERY STATION */}
        {activeTab === "HATCH" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
                1. Select Egg Species
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PET_SPECIES.map((species) => (
                  <button
                    key={species.id}
                    type="button"
                    onClick={() => setSelectedSpecies(species.id)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      selectedSpecies === species.id
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <div className="text-2xl mb-1">{species.icon}</div>
                    <div className="text-[11px] font-bold line-clamp-1">{species.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
                2. Select Hatching Potion
              </label>
              <div className="grid grid-cols-4 gap-2">
                {HATCHING_POTIONS.map((potion) => (
                  <button
                    key={potion.id}
                    type="button"
                    onClick={() => setSelectedPotion(potion.id)}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedPotion === potion.id
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-1.5 border border-stone-700"
                      style={{ backgroundColor: potion.color }}
                    />
                    <div className="text-[11px] font-bold">{potion.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex justify-end">
              <button
                onClick={handleHatch}
                className="px-6 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hatch Companion Egg</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
