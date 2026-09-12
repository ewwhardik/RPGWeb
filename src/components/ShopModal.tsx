"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Coins,
  Shield,
  Sparkles,
  ShoppingBag,
  Check,
  Footprints,
  Coffee,
  Dumbbell,
  Sun,
  MessageSquare,
  Flame,
  Award,
  Cookie,
  AlertCircle,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGold: number;
  onGoldChange: (newGold: number) => void;
  onInventoryChange: () => void;
}

const ICON_MAP: Record<string, any> = {
  Footprints,
  Coffee,
  Dumbbell,
  Shield,
  Sparkles,
  Sun,
  MessageSquare,
  Flame,
  Award,
  Cookie,
};

export default function ShopModal({
  isOpen,
  onClose,
  userGold,
  onGoldChange,
  onInventoryChange,
}: ShopModalProps) {
  const [activeTab, setActiveTab] = useState<"SHOP" | "BACKPACK">("SHOP");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function fetchItems() {
    setLoading(true);
    setErrorNotice("");
    try {
      const res = await fetch("/api/shop");
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        setErrorNotice(data.error || "The merchant catalog was misplaced.");
      }
    } catch {
      setErrorNotice("Could not contact the bazaar merchant.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(item: any) {
    if (userGold < item.price) {
      soundFx.playError();
      setErrorNotice(`You need ${item.price} Gold for ${item.name}. Slay more quests!`);
      return;
    }

    setActionLoadingId(item.id);
    setErrorNotice("");
    soundFx.playPurchase();

    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (res.ok) {
        onGoldChange(data.newGold);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isOwned: true } : i))
        );
        onInventoryChange();
      } else {
        setErrorNotice(data.error || "Purchase declined.");
      }
    } catch {
      setErrorNotice("The merchant dropped your gold coins.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleEquipToggle(item: any) {
    setActionLoadingId(item.id);
    setErrorNotice("");
    soundFx.playClick();

    try {
      const res = await fetch("/api/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, isEquipped: data.inventoryItem.isEquipped } : i
          )
        );
        onInventoryChange();
      } else {
        setErrorNotice(data.error || "Could not adjust equipment.");
      }
    } catch {
      setErrorNotice("Buckles stuck on armor.");
    } finally {
      setActionLoadingId(null);
    }
  }

  if (!isOpen) return null;

  const displayedItems =
    activeTab === "SHOP" ? items : items.filter((i) => i.isOwned);

  function getRarityStyle(rarity: string) {
    switch (rarity) {
      case "LEGENDARY":
        return "border-amber-400 text-amber-300 bg-amber-950/30";
      case "RARE":
        return "border-sky-500 text-sky-300 bg-sky-950/30";
      case "UNCOMMON":
        return "border-emerald-500 text-emerald-300 bg-emerald-950/30";
      default:
        return "border-slate-700 text-slate-300 bg-slate-900/40";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rpg-panel border border-[#b45309]/60 bg-[#121822] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-300">The Grumble & Glory Bazaar</h2>
              <p className="text-xs text-slate-400">
                Spurious relics and equipment to enhance your mortal vessel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-950/50 border border-amber-700/60 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{userGold} Gold Available</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-5 pt-3 border-b border-slate-800 gap-4 bg-[#0d1219]">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab("SHOP");
            }}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === "SHOP"
                ? "border-amber-500 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Merchant Wares ({items.length})
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab("BACKPACK");
            }}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === "BACKPACK"
                ? "border-amber-500 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Your Knapsack ({items.filter((i) => i.isOwned).length})
          </button>
        </div>

        {errorNotice && (
          <div className="mx-5 mt-3 p-2.5 bg-red-950/60 border border-red-500/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Items Grid */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Browsing merchant shelves...
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {activeTab === "BACKPACK"
                ? "Your knapsack is empty. Go purchase some questionable relics from the merchant!"
                : "No wares available right now."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedItems.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || Sparkles;
                const isOwned = item.isOwned;
                const isEquipped = item.isEquipped;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-lg border bg-[#0b0e14] flex flex-col justify-between transition-all ${
                      isEquipped
                        ? "border-emerald-500/70 bg-[#0c1815]"
                        : isOwned
                        ? "border-slate-700/80"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-amber-400">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">{item.name}</h4>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRarityStyle(
                                item.rarity
                              )}`}
                            >
                              {item.rarity}
                            </span>
                          </div>
                        </div>

                        {!isOwned && (
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span>{item.price}g</span>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug mb-1">
                        {item.description}
                      </p>

                      <p className="text-[10px] italic text-amber-200/70 leading-tight mb-2">
                        "{item.humorQuote}"
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 mb-3">
                        <span>
                          +{item.statBoost} {item.statType}
                        </span>
                        {item.isCursed && (
                          <span className="text-red-400 font-semibold" title={item.curseDescription}>
                            (Cursed!)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      {!isOwned ? (
                        <button
                          type="button"
                          onClick={() => handleBuy(item)}
                          disabled={actionLoadingId === item.id || userGold < item.price}
                          className="btn-gold w-full text-xs py-1.5"
                        >
                          {actionLoadingId === item.id
                            ? "Exchanging Gold..."
                            : userGold < item.price
                            ? "Need More Gold"
                            : `Purchase for ${item.price} Gold`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEquipToggle(item)}
                          disabled={actionLoadingId === item.id}
                          className={`w-full text-xs py-1.5 rounded font-bold transition-all ${
                            isEquipped
                              ? "btn-emerald text-xs py-1.5"
                              : "btn-dark text-xs py-1.5"
                          }`}
                        >
                          {isEquipped ? "Equipped (Click to Unequip)" : "Equip to Loadout"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
