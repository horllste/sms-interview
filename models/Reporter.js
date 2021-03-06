var mongoose = require('mongoose');

var ReporterSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Anonymous Reporter'
    }, // Name of the reporter
    phoneNumbers: [String], // Phone numbers associated with reporter
    trusted: { // Whether or not a survey is accepting responses/editable
        type: Boolean,
        default: false
    },
    currentPlaceId: String, // current place ID we're reporting for
    placeIds: [String], // placeIds of locations associated with this reporter
    surveyResponseId: String, // survey response in progress
    lockCurrentCommand: {  // for the next reply, ignore other commands
        type: Boolean,
        default: false
    },
    currentCommand: String, // command name, if a command is in progress
    nextStep: Number // 0 if no command is in progress
});

// Create a new record in the reporter's location history for non-duplicate
// locations
// Ping - this may not be needed.
ReporterSchema.methods.saveToHistory = function(locationData, callback) {
    var self = this, duplicate = false;

    // Generate a unique place id that can distinguish one location from another
    function generatePlaceId(location) {
        var id = '';
        for (var i = 0, l = location.adminLevels.length; i<l; i++) {
            var code = location.adminLevels[i].code;
            id = id+code;
            if (i+1 !== location.adminLevels.length) {
                id = id+'.';
            }
        }
        return id;
    }

    // Determine if this is a duplicate of any places in history
    var newOne = generatePlaceId(locationData);
    for (var i = 0, l = self.locationHistory.length; i<l; i++) {
        var current = generatePlaceId(self.locationHistory[i]);
        if (newOne === current) {
            duplicate = true;
            break;
        }
    }

    if (!duplicate) {
        self.locationHistory.push(locationData);
        self.save(callback);
    } else {
        callback(null, self);
    }
};

module.exports = mongoose.model('Reporter', ReporterSchema);
