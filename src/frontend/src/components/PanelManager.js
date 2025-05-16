import React, { useState, useEffect } from "react";
import InitiativePanel from "./InitiativePanel";
import CharacterPanel from "./CharacterPanel";
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
      }

      if (filePath.command === "/characters") {
        setShowCharacters(true);
        setCharactersDocked(false);
        setCharactersTab(false);
      }
    }
  }, [filePath]);

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
        onClose: () => setShowInitiative(false),
        onHide: () => {
          setShowInitiative(false);
          setInitiativeDocked(true);
        },
        onTabView: () => {
          setShowInitiative(false);
          setInitiativeTab(true);
        },
        onUpdate: (entries) => {
          persistInitiativeState(entries);
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
