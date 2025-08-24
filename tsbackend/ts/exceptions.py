from rest_framework import status
from rest_framework.exceptions import APIException


class VersionConflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Version conflict."
    default_code = "version_conflict"


class InvalidState(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid session state."
    default_code = "invalid_state"


class TurnNotCurrent(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Turn is not current."
    default_code = "turn_not_current"


class OptionInvalid(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid option."
    default_code = "option_invalid"


class TurnAlreadyAnswered(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Turn already answered."
    default_code = "turn_already_answered"