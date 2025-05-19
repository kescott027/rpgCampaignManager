import logging
from src.backend.controller import Dispatcher

logging.basicConfig(level=logging.DEBUG)


class ShowCommandHandler(Dispatcher):
    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching ShowCommandHandler controller')
        self.commands = {
            "initiative_queue": self._show_initiative_queue,
            "characters": self._show_characters,
            "help": self._show_help
        }


    def show(self, command, args=None):
        if not args:
            return self._show_help()

        subcommand = args[0].lower()
        handler = self.commands.get(subcommand)
        if handler:
            return handler()
        else:
            return {"response": f"⚠️ Unknown /show command '{subcommand}'. Try /show help."}


    def interface(self, command, args=None):
        return self.show(command, args)


    def _show_help(self):
        return {
            """response: (
                📖 Available /show commands:

                • /show initiative_queue – display current initiative queue

                • /show characters – display all characters

                • /show help – show this help message"
            )"""
        }


    def _show_initiative_queue(self):
        from src.backend.controller_datastore import CombatDatastore
        db = CombatDatastore()
        queue = db.get_combat_queue(include_inactive=True)
        return {"response": f" Initiative Queue: {queue}"}


    def _show_characters(self):
        from src.backend.controller_characters import CharacterDatastore
        db = CharacterDatastore()
        chars = db.get_characters(include_inactive=True)
        return {"response": f"👥 Characters: {chars}"}
