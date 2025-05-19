import React, { useState, useEffect } from "react";
import InitiativePanel from "./InitiativePanel";
import CharacterPanel from "./CharacterPanel";
import { startCombat } from "../handlers/startCombatHandler";
import { advanceTurn, reverseTurn } from "../handlers/turnHandlers";
import { persistInitiativeState } from "../utils/initSync";

export default function PanelManager({
                                       filePath,
                                       onFileSelect,
                                       renderInitiativePanel,
                                       renderCharacterPanel,
                                       setInitiativeTab,
                                       setCharactersTab
                                     }) {
  const [showInitiative, setShowInitiative] = useState(false);
  const [initiativeDocked, setInitiativeDocked] = useState(false);
  const [initiativeQueue, setInitiativeQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCharacters, setShowCharacters] = useState(false);
  const [charactersDocked, setCharactersDocked] = useState(false);

  useEffect(() => {
    if (filePath && typeof filePath === "object") {
      if (filePath.toggle === "initiative") {
        setShowInitiative((prev) => !prev);
        setInitiativeDocked(false);
        setInitiativeTab(false);
      }
      if (filePath.toggle === "characters") {
        setShowCharacters((prev) => !prev);
        setCharactersDocked(false);
        setCharactersTab(false);
      }

      if (filePath.command === "/initiative") {
        setShowInitiative(true);
        setInitiativeDocked(false);
        setInitiativeTab(false);

        const loadInitiativeQueue = async () => {
          try {
            const res = await fetch("/api/datastore/combat-queue");
            const data = await res.json();
            const queue = data.queue || [];
            setInitiativeQueue(queue);
            setCurrentIndex(0);
          } catch (err) {
            console.error("❌ Failed to fetch combat queue:", err);
          }
        };

        loadInitiativeQueue();
        setShowInitiative(true);
        setInitiativeDocked(false);
        setInitiativeTab(false);

        // Fetch initiative queue from datastore
        fetch("/api/datastore/combat-queue")
          .then((res) => res.json())
          .then((data) => {
            const queue = data.queue || [];
            setInitiativeQueue(queue);
            setCurrentIndex(0);
          })
          .catch((err) => {
            console.error("❌ Failed to fetch combat queue:", err);
          });

        setShowInitiative(true);
        setInitiativeDocked(false);
        setInitiativeTab(false);
      }

      if (filePath.command === "/characters") {
        setShowCharacters(true);
        setCharactersDocked(false);
        setCharactersTab(false);
      }
    }
  }, [filePath]);
  console.log("📊 initiativeQueue:", initiativeQueue);

  return (
    <>
      {/* Docked Buttons */}
      {initiativeDocked && (
        <button
          className="initiative-dock-icon"
          title="Show Initiative Tracker"
          onClick={() => {
            setInitiativeDocked(false);
            setShowInitiative(true);
          }}
        >
          🎲
        </button>
      )}

      {charactersDocked && (
        <button
          className="character-dock-icon"
          title="Show Character Panel"
          onClick={() => {
            setCharactersDocked(false);
            setShowCharacters(true);
          }}
        >
          👤
        </button>
      )}

      {showInitiative && renderInitiativePanel(false, {
        characters: initiativeQueue,              // ✅ THIS
        currentIndex: currentIndex,
        onStartCombat: async (entries) => {
          const sorted = await startCombat(entries);   // ← sorts, persists, sends to OBS
          setInitiativeQueue(sorted);                  // ← update internal state
          setCurrentIndex(0);                    // ← highlight first slot

          onFileSelect && onFileSelect({
            command: "/initiative",
            timestamp: Date.now()                      // ← force UI reload if needed
          });
        },
        onNext: async () => {
          const result = await advanceTurn(initiativeQueue, currentIndex);
          setCurrentIndex(result.currentIndex);
        },
        onPrevious: async () => {
          const result = await reverseTurn(initiativeQueue, currentIndex);
          setCurrentIndex(result.currentIndex);
        },
        onClose: () => setShowInitiative(false),
        onHide: () => {
          setShowInitiative(false);
          setInitiativeDocked(true);
        },
        onTabView: () => {
          setShowInitiative(false);
          setInitiativeTab(true);
        },
        onUpdate: async (entries) => {
          await fetch("/api/datastore/update-combat-queue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries })
          });

          const res = await fetch("/api/datastore/combat-queue");
          const data = await res.json();
          setInitiativeQueue(data.queue || []);
        }
      })}

      {showCharacters && renderCharacterPanel(false, {
        onClose: () => setShowCharacters(false),
        onHide: () => {
          setShowCharacters(false);
          setCharactersDocked(true);
        },
        onTabView: () => {
          setShowCharacters(false);
          setCharactersTab(true);
        },
        onUpdate: () => {
        }  // Reserved for character syncing logic
      })}
    </>
  );
}
