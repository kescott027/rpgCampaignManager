#.src.backend.controller_command.py
import collections
import json
import logging
import re
import requests
from src.backend.controller_combat import CombatDatastore, CombatHandler
from src.backend.controller_configuration import Configuration
from src.backend.controller_gpt import GPTProxy
from src.backend.controller_help import HelpCommandHandler
from src.backend.controller_initiative import InitiativeCommandHandler
from src.backend.controller_obs import OBSController, OBSCommandHandler
from src.backend.controller_show import ShowCommandHandler
from src.backend.controller import Parser, Dispatcher

logging.basicConfig(level=logging.DEBUG)


class CommandHandler(Dispatcher):
    def __init__(self, source='Unknown'):
        super().__init__()
        self.source = source
        logging.debug(f'{source} launching Storage controller')
        self.config = Configuration(source='CommandHandler')
        self.help = HelpCommandHandler(source='CommandHandler')
        self.show_handler = ShowCommandHandler(source='CommandHandler')
        self.obs_handler = OBSCommandHandler(source='CommandHandler')
        self.obs_proxy = OBSController(source='CommandHandler')
        self.gpt_proxy = GPTProxy(source='CommandHandler')
        self.initiative_handler = InitiativeCommandHandler(source='CommandHandler')
        self.combat_handler = CombatHandler(source='CommandHandler')
        self.combat_datastore = CombatDatastore(source='CommandHandler')
        self.url = "http://localhost:8000"
        self.headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer your_token'}



    def command_default(self, command, args):
        logging.debug(f"Error calling command /{command} {args}")
        reply = f"unknown command /{command} {args}\nTry /help for available commands"
        return {"response": reply}


    def gpt_command(self, request, prompt):
        return self.gpt_handler(request, prompt)


    def get_command(self, command, args):
        url = f"{self.url}{args}"

        # try:
        # response = requests.get(self.url, headers=self.headers, params=None)
        response = requests.get(url, params=None)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        return {"response": response}

        # except requests.exceptions.RequestException as e:
        #     logging.error(f"GET Request failed: {e}")
        #     reply = None

        return {"response": reply}


    def post_command(self, command, params):
        reply = None
        return {"response": reply}


    def help_command(command, args=None):
        return self.help(command, args)


    def interface(self, user_input):
        class_namne = self.__classname__
        logging.debug(f"{class_namne} dispatching parsing command /{user_input}")
        command, args, error = self.parser(user_input, trigger='/')
        if error:
            return {"response": error}

        return self.dispatcher(command, args, default_method='command_default')


    def initiative_command(self, command, args=None):
        logging.info(f"CommandHandler:{command}: {args}")
        return self.initiative_handler.initiative(command, args)


    def init_get_command(self, command, args=None):
        logging.info(f"CommandHandler:{command}: {args}")
        return self.combat_handler.get_initiative_queue(command, args)

    def do_init_something(self, command, args=None):
        return None

    def init_set_command(self, command, args):
        return self.combat_handler.set_initiative(args)


    @staticmethod
    def log_command(command, args=None):
        if not args:
            args = ['empty', 'console logs requested from command line']
        logging.warning(f"{' '.join(args)}")
        return

    def next_action_command(self, command, args=None):
        return self.initiative_handler.next_action(command, args)


    def obs_command(self, command, args):
        return self.obs_handler.scene(command, args)


    def previous_action_command(self, command, args=None):
        return self.initiative_handler.previous_action(command, args)


    def reset_slot_command(self, command, args=None):
        return self.initiative_handler.reset_slot(command, args)


    def set_action_command(self, command, args=None):
        return self.initiative_handler.set_action(command, args)

    def show_command(self, command, args=None):
        return self.show_handler.show(command, args)




