#controller_help.py
import logging


logging.basicConfig(level=logging.DEBUG)


class HelpCommandHandler:
    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching Configuration controller')

    def dispatcher(self, command, args):
            logging.debug(f"help.dispatcher routing help /{command} {args}")
            return getattr(self, f"{command}_help", self.default_help)

    @staticmethod
    def initiative_help(command, args=None):
        return {"""
             /initiative </br>
            \tuse:  /initiative<br>
            \targs:  None<br>
            \tresponse: opens the ui initiative tracker.<br><br>
            """ }

    @staticmethod
    def default_help(command, args=None):
        return{"""
            / command options:<br><br>
            \t/initiative - opens the ui initiative tracker.<br>
            \t/scene - changes obs scene to the requested new scene.<br>
            \t/next - advances initiative to the next in order.<br>
            \t/set_action - resets initiative with current order.<br>
            \t/reset_slot - resets the current initiative slot to 0.<br>
            """ }


    @staticmethod
    def scene_help(command, args=None):
        return {"""
        /scene <br><br>
        \tuse:  /scene scene_name<br>
        \targs:  name of requested scene <br>
        \tresponse: switches the current obs scene to the requested scene if exists.<br><br>
        """ }


    @staticmethod
    def next_help(command, args=None):
        return {"""
        /next <br><br>
        \tuse:  /next<br>
        \targs:  None<br>
        \tresponse: moves initiative to the next initiative slot in order.<br><br>
        """ }


    @staticmethod
    def rebuild_help(command, args=None):
        return {"""
        <p>rebuild </p>
        \tuse:  /rebuild<br>
        \targs:  None<br>
        \tresponse: Clear and regenerate: initiative_order, initiative_pending,
        initiative_values, current_slot, Re-sync scene_mapping based on
        current characters, Reset first_pass_done flag.<br><br>
        """ }

    @staticmethod
    def reset_slot_help(command, args=None):
        return {"""
        /reset_slot <br><br>
        \tuse:  /reset_slot<br>
        \targs:  None<br>
        \tresponse: sets the current initative slot to value 0.<br><br>
        """ }


    @staticmethod
    def set_action(command, args=None):
        return {"""
        /set_action <br><br>
        \tuse:  /set_action<br>
        \targs:  None<br>
        \tresponse: resets initiative moving initiative to the top of the order.<br><br>
        """ }


    @staticmethod
    def override_help(command, args=None):
        return {"""
        /override <br><br>
        \tuse:  /override config_key {config_value}<br>
        \targs:  config_key - key in cached_configs.json to ovrrride
        {config_value} json formatted dictionary or list value to set key to.
        \tresponse: sets the overridden key to the specified value<br><br>
        """ }

