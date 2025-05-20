#.src.backend.controller_command.py
import collections
import json
import logging
from src.backend.controller_configuration import Configuration
from src.backend.controller_obs import OBSController
from src.backend.controller_gpt import GPTProxy
from src.backend.controller_combat import CombatDatastore

logging.basicConfig(level=logging.DEBUG)


class InitiativeCommandHandler:
    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching InitiativeCommandHandler')
        self.combat_handler = CombatDatastore(source='InitiativeCommandHandler')

    def rebuild(self, command, args=None):
        return None


    def submit(self, command, args):
        return None


    def initiative(self, command, args):

        flag = None
        logging.error(f"initiative_controller:initiative call: {command} {args}")
        if args == 'include_inactive':
            flag = include_inactive=True
        initiative = self.combat_handler.get_combat_queue(command, flag)

        return None

    def previous_action(self, command, args=None):
       from src.backend.controller_datastore import CombatDatastore
       db = CombatDatastore()

       prev = db.reverse_turn()
       if not prev:
           return {"response": "⚠️ Cannot go back — no combatants."}

       name = prev["name"]
       scene = prev.get("scene") or name

       try:
           self.obs_proxy.change_scene(scene)
       except Exception as e:
           logging.error(f"❌ OBS scene update failed: {e}")

       return {
           "response": f"🔁 Reversed to {name}'s turn. (Scene: {scene})",
           "current": name,
           "current_index": prev["current_index"]
       }


    def next_action(self, command, args=None):
       from src.backend.controller_datastore import CombatDatastore
       db = CombatDatastore()

       next_entry = db.advance_turn()

       if not next_entry:
           return {"response": "⚠️ No active combatants."}

       name = next_entry["name"]
       scene = next_entry.get("scene") or name
       index = next_entry["current_index"]

       try:
           self.obs_proxy.change_scene(scene)
       except Exception as e:
           logging.error(f"❌ OBS scene update failed: {e}")

       return {
           "response": f"🎯 It is now {name}'s turn! (Scene: {scene})",
           "current": name,
           "current_index": index,
           "scene": scene
           }


    def reset_slot(self, command, args=None):
        return None



