# controller.py core classes for controllers
import re
import logging

logging.basicConfig(level=logging.INFO)

class CommandOperator:
    def __init__(self):
        self.__classname__ = str(type(self).__name__)
        self.__entry_point__ = str(type(self).__name__.lower())


    def interface(self, *args, **kwargs):
        str_commands = str(*args, **kwargs)
        logging.debug(f"{self.__classname__} :interface: {str_commands}")
        entry_point = self.__classname__
        command_method = getattr(self, f"{entry_point}", self.__fail_back__)
        return command_method(*args, **kwargs)


class Parser(CommandOperator):
    def __init__(self):
        super().__init__()


    def __fail_back__(*args, **kwargs):
        return


    def parser(self, user_input, trigger=None):
        this_class = self.__classname__
        logging.debug(f"{this_class}.parser() received prompt: {user_input}")

        input = user_input['command'].strip()

        if trigger:
            input = input[1:] if input.startswith(trigger) else input

        if not input:
            return None, None, f"Invalid command syntax. {this_class} expects command following {trigger}.  See {trigger}.help"

        commands = input.split()
        verb = commands.pop(0).lower()
        args = None

        # do not allow non-alpha-numeric in the command
        if re.findall(r'[^a-zA-Z0-9_-]', verb):
            return None, None, f"Invalid characters in syntax. {this_class} expects command to be alphanumeric only.  See {trigger}.help"

        remainder = " ".join(commands)
        if remainder:
            args = remainder
        logging.debug(f"{this_class}.parser() parsed command line:  verb: {verb} - args: {args}")

        return verb, args, None


class Dispatcher(Parser):
    def __init__(self):
        super().__init__()


    def dispatcher(self, command, args=None, default_method=None):

        this_class = type(self).__name__
        logging.info(f"{this_class} dispatching command /{command} {args}")
        dispatch_method = getattr(self, f"{command}_command", self.__fail_back__)

        return dispatch_method(command, args)
