# handles messy text lines for help functions.
import logging


def slash_command_help(command, args="default"):
    # messy long string values.  Moved to a utility

    available_topics = {
    "initiative": {"""
    /initiative \n\n
    \tuse:  /initiative\n
    \targs:  None\n
    \tresponse: opens the ui initiative tracker.\n\n
    """ },
    "scene": {"""
    /scene \n\n
    \tuse:  /scene scene_name\n
    \targs:  name of requested scene \n
    \tresponse: switches the current obs scene to the requested scene if exists.\n\n
    """ },
    "next": {"""
    /next \n\n
    \tuse:  /next\n
    \targs:  None\n
    \tresponse: moves initiative to the next initiative slot in order.\n\n
    """ },
    "rebuild": {"""
    /rebuild \n\n
    \tuse:  /rebuild\n
    \targs:  None\n
    \tresponse: Clear and regenerate: initiative_order, initiative_pending,
    initiative_values, current_slot, Re-sync scene_mapping based on
    current characters, Reset first_pass_done flag.\n\n
    """ },
    "reset_slot": {"""
    /reset_slot \n\n
    \tuse:  /reset_slot\n
    \targs:  None\n
    \tresponse: sets the current initative slot to value 0.\n\n
    """ },
    "set_action": {"""
    /set_action \n\n
    \tuse:  /set_action\n
    \targs:  None\n
    \tresponse: resets initiative moving initiative to the top of the order.\n\n
    """ },
    "override": {"""
    /override \n\n
    \tuse:  /override config_key {config_value}\n
    \targs:  config_key - key in cached_configs.json to ovrrride
    {config_value} json formatted dictionary or list value to set key to.
    \tresponse: sets the overridden key to the specified value\n\n
    """ },
    "default": {"""
        / command options:\n\n
        \t/initiative - opens the ui initiative tracker.\n
        \t/scene - changes obs scene to the requested new scene.\n
        \t/next - advances initiative to the next in order.\n
        \t/set_action - resets initiative with current order.\n
        \t/reset_slot - resets the current initiative slot to 0.\n
        \t/override - manually create an override of cached configs.\n
        \n""" }
    }

    topic_request = "default"
    try:
        topic_request = args[0]

    except IndexError as error:
        message = f"args: {args} mal-formatted - {error}."
        logging.error(message)

    topic = available_topics.get(topic_request, None)
    if not topic:
        topic = available_topics['default']

    return topic
