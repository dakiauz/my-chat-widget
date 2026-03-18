# Sound Files for Dialer Interface

This directory contains audio files used by the dialer application:

- `ringtone.mp3` - Played when there's an incoming call
- `call-end.mp3` - Played when a call ends
- `dial-tone.mp3` - Played when dialing a number
- `dtmf-0.mp3` through `dtmf-9.mp3` - DTMF tones for digits 0-9
- `dtmf-*.mp3` - DTMF tone for * key
- `dtmf-#.mp3` - DTMF tone for # key

## Note

These are minimal placeholder audio files. In a production environment, you should replace them with properly licensed audio files that provide appropriate sounds for each action.

## Usage

These files are loaded by the AudioManager utility and played at appropriate times during call flow.
