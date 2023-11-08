// RCTSoundModule.m
#import "RCTSoundModule.h"
#import <React/RCTLog.h>
#import <AudioToolbox/AudioToolbox.h>

@implementation RCTSoundModule


// To export a module named RCTSoundModule
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(playSound:(NSString *)name location:(NSString *)location)
{
 RCTLogInfo(@"Pretending to play a sound %@ at %@", name, location);
  
 SystemSoundID soundID;
 NSString *soundFile = [[NSBundle mainBundle]
                         pathForResource:@"click" ofType:@"mp3"];
  AudioServicesCreateSystemSoundID((__bridge  CFURLRef)
                                   [NSURL fileURLWithPath:soundFile], & soundID);
  
  for (int i = 1; i <= 10; i++)
    {
        AudioServicesPlaySystemSound(soundID);
    }

  
}

@end
