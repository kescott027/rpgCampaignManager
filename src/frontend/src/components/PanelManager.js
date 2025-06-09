import React, { useState, useEffect } from "react";
import { startCombat } from "../handlers/startCombatHandler";
import { advanceTurn, reverseTurn } from "../handlers/turnHandlers";
import { get, post } from "../utils/api";


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
            const data = await get("/api/combat/combat-queue");
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
        get("/api/combat/combat-queue")
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
  }, [setInitiativeTab, setCharactersTab, filePath]);
  console.log("📊 initiativeQueue:", initiativeQueue);

  const handleJumpToIndex = async (index) => {
    try {
      const response = await post("/api/combat/jump-to-index", { index });
      if (response && response.scene) {
        setCurrentIndex(index); // update local current turn
        await post("/api/obs/set-scene", { scene: response.scene }); // tell OBS
      }
    } catch (err) {
      console.error("Jump to index failed:", err);
    }
  };


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
        characters: initiativeQueue,
        currentIndex: currentIndex,
        onJumpToIndex: handleJumpToIndex,
        onStartCombat: async (entries) => {
          const sorted = await startCombat(entries);
          setInitiativeQueue(sorted);
          setCurrentIndex(0);

          onFileSelect && onFileSelect({
            command: "/initiative",
            timestamp: Date.now()
          });
        },

        onRefresh: async () => {
          const data = await get("/api/combat/combat-queue");
          const updated = data.queue || [];
          setInitiativeQueue(updated);
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
          await post("/api/combat/update-combat-queue", { entries });
          const data = await get("/api/combat/combat-queue");
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
