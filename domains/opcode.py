from enum import Enum


class Opcode(Enum):
    DISPATCH = 0
    HEARTBEAT = 1
    IDENTIFY = 2
    INVALID_SESSION = 9
    HELLO = 10
    HEARTBEAT_ACK = 11
