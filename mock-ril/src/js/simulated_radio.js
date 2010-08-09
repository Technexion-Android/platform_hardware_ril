/**
 * Copyright (C) 2010 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Simulated Radio
 */
function Radio() {
    var registrationState = '1';
    var lac = '0';
    var cid = '0';
    var radioTechnology = '3';
    var baseStationId = NULL_RESPONSE_STRING;
    var baseStationLatitude = NULL_RESPONSE_STRING;
    var baseStationLongitude = NULL_RESPONSE_STRING;
    var concurrentServices = NULL_RESPONSE_STRING;
    var systemId  = NULL_RESPONSE_STRING;
    var networkId = NULL_RESPONSE_STRING;
    var roamingIndicator = NULL_RESPONSE_STRING;
    var prlActive = NULL_RESPONSE_STRING;
    var defaultRoamingIndicator = NULL_RESPONSE_STRING;
    var registrationDeniedReason = NULL_RESPONSE_STRING;
    var primaryScrambingCode = NULL_RESPONSE_STRING;

    var NETWORK_SELECTION_MODE_AUTOMATIC = 0;
    var NETWORK_SELECTION_MODE_MANUAL = 1;
    var networkSelectionMode = NETWORK_SELECTION_MODE_AUTOMATIC;

    // Number of active calls in calls
    var numberActiveCalls = 0;

    // Maximum number of active calls
    var maxNumberActiveCalls = 7;

    // Array of "active" calls
    var calls = Array();

    // The result returned by the request handlers
    var result = new Object();

    /**
     * Create a call.
     *
     * @return a RilCall
     */
    this.RilCall = function(state, phoneNumber, callerName) {
        this.state = state;
        this.index = 0;
        this.toa = 0;
        this.isMpty = false;
        this.isMt = false;
        this.als = 0;
        this.isVoice = true;
        this.isVoicePrivacy = false;
        this.number = phoneNumber;
        this.numberPresentation = 0;
        this.name = callerName;
    }

    /**
     * The the array of calls, this is a sparse
     * array and some elements maybe 'undefined'.
     *
     * @return Array of RilCall's
     */
    this.getCalls = function() {
        return calls;
    }

    /**
     * @return the RilCall at calls[index] or null if undefined.
     */
    this.getCall = function(index) {
        try {
            c = calls[index];
            if (typeof c == 'undefined') {
                c = null;
            }
        } catch (err) {
            c = null;
        }
        return c;
    }

    /**
     * Add an active call.
     *
     * @return a RilCall or null if too many active calls.
     */
    this.addCall = function(state, phoneNumber, callerName) {
        c = null;
        if (numberActiveCalls < maxNumberActiveCalls) {
            numberActiveCalls += 1;
            c = new this.RilCall(state, phoneNumber, callerName);
            c.index = calls.length;
            calls[calls.length] = c;
        }
        return c;
    }

    /**
     * Remove the call, does nothing if the call is undefined.
     *
     * @param index into calls to remove.
     * @return the call removed or null if did not exist
     */
    this.removeCall = function(index) {
        if ((numberActiveCalls > 0)
                 && (index < calls.length)
                 && (typeof calls[index] != 'undefined')) {
            c = calls[index];
            delete calls[index];
            numberActiveCalls -= 1;
            if (numberActiveCalls == 0) {
                calls = new Array();
            }
        } else {
            c = null;
        }
        return c;
    }

    /**
     * Print the call
     *
     * @param c is the RilCall to print
     */
    this.printCall = function(c) {
        if ((c == null) || (typeof c == 'undefined')) {
            print('c[' + i + ']: undefined');
        } else {
            print('c[' + i + ']: index=' + c.index +
                                ' number=' + c.number +
                                ' name=' + c.name);
        }
    }

    /**
     * Print all the calls.
     *
     * @param callArray is an Array of RilCall's
     */
    this.printCalls = function(callArray) {
        if (typeof callArray == 'undefined') {
            callArray = calls;
        }
        print('callArray.length=' + callArray.length);
        for (i = 0; i < callArray.length; i++) {
            this.printCall(callArray[i]);
        }
    }

    /**
     * Handle RIL_REQUEST_GET_CURRENT_CALL
     *
     * @param req is the Request
     */
    this.rilRequestGetCurrentCalls = function(req) { // 9
        print('Radio: rilRequestGetCurrentCalls E');
        rsp = new Object();

        // pack calls into rsp.calls
        rsp.calls = new Array();
        for (i = 0, j = 0; i < calls.length; i++) {
            if (typeof calls[i] != 'undefined') {
                rsp.calls[j++] = calls[i];
            }
        }
        result.responseProtobuf =  rilSchema[packageNameAndSeperator +
                                      'RspGetCurrentCalls'].serialize(rsp);
        return result;
    }

    /**
     * Handle RIL_REQUEST_HANG_UP
     *
     * @param req is the Request
     */
    this.rilRequestHangUp = function(req) { // 12
        print('Radio: rilRequestHangUp data.connection_index=' + req.data.connectionIndex);
        if (removeCall(req.data.connectionIndex) == null) {
            result.rilErrCode = RIL_E_GENERIC_FAILURE;
        }
        return result;
    }

    /**
     * Handle RIL_REQUEST_REGISTRATION_STATE
     *
     * @param req is the Request
     */
    this.rilRequestRegistrationState = function(req) { // 20
        print('Radio: rilRequestRegistrationState');

        var rsp = Object();
        rsp.strings = Array();
        rsp.strings[0] = registrationState;
        rsp.strings[1] = lac;
        rsp.strings[2] = cid;
        rsp.strings[3] = radioTechnology;
        rsp.strings[4] = baseStationId;
        rsp.strings[5] = baseStationLatitude;
        rsp.strings[6] = baseStationLongitude;
        rsp.strings[7] = concurrentServices;
        rsp.strings[8] = systemId;
        rsp.strings[9] = networkId;
        rsp.strings[10] = roamingIndicator;
        rsp.strings[11] = prlActive;
        rsp.strings[12] = defaultRoamingIndicator;
        rsp.strings[13] = registrationDeniedReason;
        rsp.strings[14] = primaryScrambingCode;

        result.responseProtobuf = rilSchema[packageNameAndSeperator +
                                 'RspStrings'].serialize(rsp);
        return result;
    }

    /**
     * Handle RIL_REQUEST_GPRS_REGISTRATION_STATE
     *
     * @param req is the Request
     */
    this.rilRequestGprsRegistrationState = function(req) { // 21
        print('Radio: rilRequestGprsRegistrationState');

        var rsp = Object();
        rsp.strings = Array();
        rsp.strings[0] = registrationState;
        rsp.strings[1] = lac;
        rsp.strings[2] = cid;
        rsp.strings[3] = radioTechnology;

        result.responseProtobuf = rilSchema[packageNameAndSeperator +
                                 'RspStrings'].serialize(rsp);
        return result;
    }

    /**
     * Handle RIL_REQUEST_QUERY_NETWORK_SELECTION_MODE
     *
     * @param req is the Request
     */
    this.rilRequestQueryNeworkSelectionMode = function(req) { // 45
        print('Radio: rilRequestQueryNeworkSelectionMode');

        var rsp = Object();
        rsp.integers = Array();
        rsp.integers[0] = networkSelectionMode;

        result.responseProtobuf = rilSchema[packageNameAndSeperator +
                                 'RspIntegers'].serialize(rsp);
        return result;
    }

    /**
     * Handle RIL_REQUEST_SET_NETWORK_SELECTION_AUTOMATIC
     *
     * @param req is the Request
     */
    this.rilRequestSetNeworkSelectionAutomatic = function(req) { // 46
        print('Radio: rilRequestSetNeworkSelectionAutomatic');

        networkSelectionMode = NETWORK_SELECTION_MODE_AUTOMATIC;

        return result;
    }

    /**
     * Handle RIL_REQUEST_BASE_BAND_VERSION
     *
     * @param req is the Request
     */
    this.rilRequestBaseBandVersion = function (req) { // 51
        print('Radio: rilRequestBaseBandVersion');
        var rsp = Object();
        rsp.strings = Array();
        rsp.strings[0] = gBaseBandVersion;

        result.responseProtobuf = rilSchema[packageNameAndSeperator +
                                 'RspStrings'].serialize(rsp);
        return result;
    }

    /**
     * Handle RIL_REQUEST_SCREEN_STATE
     *
     * @param req is the Request
     */
    this.rilRequestScreenState = function (req) { // 61
        print('Radio: rilRequestScreenState: req.data.state=' + req.data.state);
        screenState = req.data.state;
        return result;
    }

    /**
     * Process the request by dispatching to the request handlers
     */
    this.process = function(req) {
        try {
            //print('Radio E: req.reqNum=' + req.reqNum + ' req.token=' + req.token);

            // Assume the result will be true, successful and nothing to return
            result.sendResponse = true;
            result.rilErrCode = RIL_E_SUCCESS;
            result.responseProtobuf = emptyProtobuf;

            try {
                result = this.radioDispatchTable[req.reqNum](req);
            } catch (err) {
                print('Radio: Unknown reqNum=' + req.reqNum);
                result.rilErrCode = RIL_E_REQUEST_NOT_SUPPORTED;
            }

            if (result.sendResponse) {
                sendRilRequestComplete(result.rilErrCode, req.reqNum,
                        req.token, result.responseProtobuf);
            }

            //print('Radio X: req.reqNum=' + req.reqNum + ' req.token=' + req.token);
        } catch (err) {
            print('Radio: Exception req.reqNum=' +
                    req.reqNum + ' req.token=' + req.token + ' err=' + err);
        }
    }

    /**
     * Construct the simulated radio
     */
    print('Radio: constructor E');
    this.radioDispatchTable = new Array();
    this.radioDispatchTable[RIL_REQUEST_GET_CURRENT_CALLS] = // 9
                this.rilRequestGetCurrentCalls;
    this.radioDispatchTable[RIL_REQUEST_HANGUP] = // 12
                this.rilRequestHangUp;
    this.radioDispatchTable[RIL_REQUEST_REGISTRATION_STATE] = // 20
                this.rilRequestRegistrationState;
    this.radioDispatchTable[RIL_REQUEST_GPRS_REGISTRATION_STATE] = // 21
                this.rilRequestGprsRegistrationState;
    this.radioDispatchTable[RIL_REQUEST_QUERY_NETWORK_SELECTION_MODE] = // 45
                this.rilRequestQueryNeworkSelectionMode;
    this.radioDispatchTable[RIL_REQUEST_SET_NETWORK_SELECTION_AUTOMATIC] = // 46
        this.rilRequestSetNeworkSelectionAutomatic;
    this.radioDispatchTable[RIL_REQUEST_BASEBAND_VERSION] = // 51
                this.rilRequestBaseBandVersion;
    this.radioDispatchTable[RIL_REQUEST_SCREEN_STATE] = // 61
                this.rilRequestScreenState;
    print('Radio: constructor X');
}

// The simulated radio instance and its associated Worker
var simulatedRadio = new Radio()
var simulatedRadioWorker = new Worker(function (req) {
    simulatedRadio.process(req);
});
simulatedRadioWorker.run();

/**
 * TODO: A test for RIL_REQUEST_GET_CURRENT_CALLS,
 *       remove when satisfied all is well.
 */
if (true) {
    var calls = simulatedRadio.getCalls();

    function testCalls() {
        print('testCalls E:');
        c0 = simulatedRadio.addCall('CALLSTATE_ACTIVE', '18312342134', 'wink');
        simulatedRadio.printCalls();
        c1 = simulatedRadio.addCall('CALLSTATE_ACTIVE', '18312342135', 'me');
        simulatedRadio.printCalls();
        simulatedRadio.removeCall(c0.index);
        simulatedRadio.printCalls();

        result = simulatedRadio.rilRequestGetCurrentCalls();
        newCalls = rilSchema[packageNameAndSeperator +
                        'RspGetCurrentCalls'].parse(result.responseProtobuf);
        simulatedRadio.printCalls(newCalls.calls);

        // Set to false to test RIL_REQUEST_GET_CURRENT_CALLS as there will
        // be on call still ative on the first RIL_REQUEST_GET_CURRENT_CALLS
        // request.
        if (false) {
            simulatedRadio.removeCall(c1.index);
            simulatedRadio.printCalls();
        }
        print('testCalls X:');
    }

    testCalls();
}