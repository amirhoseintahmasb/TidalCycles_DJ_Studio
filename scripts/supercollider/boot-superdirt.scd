// Boot SuperDirt for TidalCycles
// Run this in SuperCollider (Cmd+Enter on the block)

(
s.reboot { // restart server
s.options.numBuffers = 1024 * 256;
s.options.memSize = 8192 * 32;
    s.options.numWireBufs = 64;
s.options.maxNodes = 1024 * 32;
s.options.numOutputBusChannels = 2;
s.options.numInputBusChannels = 2;

    s.waitForBoot {
    ~dirt = SuperDirt(2, s);
    ~dirt.loadSoundFiles;
        s.sync;
    ~dirt.start(57120, 0 ! 12);

        "
========================================
✅ SuperDirt is ready!
   Listening on port 57120
   Now start TidalCycles in GHCi
========================================
".postln;
    };
};
)
