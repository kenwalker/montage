//Setup Config
jasmine.getEnv().addReporter(new jasmine.TrivialReporter());

queryString = function(parameter) {
    var i, key, value, equalSign;
    var loc = location.search.substring(1, location.search.length);
    var params = loc.split('&');
    for (i=0; i<params.length;i++) {
        equalSign = params[i].indexOf('=');
        if (equalSign < 0) {
            key = params[i];
            if (key == parameter) {
                value = true;
                break;
            }
        }
        else {
            key = params[i].substring(0, equalSign);
            if (key == parameter) {
                value = params[i].substring(equalSign+1);
                break;
            }
        }
    }
    return value;
};

var updateReporter = function() {
    var runner = jasmine.getEnv().currentRunner();
    runner.finishCallback();
}

addMontageMetadataToProto = function(objectName, moduleId, proto) {
    Object.defineProperty(proto, "_montage_metadata", { value: { moduleId: moduleId, objectName: objectName, isInstance: false }, enumerable: false});
};

var waitsThen = function(promise, resolved) {
    waitsFor(function() {
        return promise._pending == null;
    }, "promise", 500);
    resolved(promise.valueOf());
};

var expectationToDispatch = function(object, expectation, handleEvent) {

    var handler = {
        handleEvent: handleEvent? handleEvent : function(event) {}
    };

    if (typeof expectation === "string") {
        // expect event name
        spyOn(handler, "handleEvent").andCallThrough();
        object.addEventListener(expectation, handler, false);
    }

    return function(negate) {
        if (negate) {
            expect(handler.handleEvent).not.toHaveBeenCalled();
        } else {
            expect(handler.handleEvent).toHaveBeenCalled();
        }
    }

};

/**
Monkey-patches support for promises in Jasmine test blocks.
@fileoverview
@example
describe("promise", function () {
    it("times out", function () {
        return Promise.delay(100).timeout(50)
        .then(function (value) {
            expect(true).toBe(false);
        }, function (error) {
            expect(error).toBe("Timed out");
        })
    });
});
*/

jasmine.Block.prototype.execute = function (onComplete) {
    var spec = this.spec;
    var result;
    try {
        result = this.func.apply(spec);
    } catch (error) {
        spec.fail(error);
    }
    if (typeof result === 'undefined') {
        onComplete();
    } else if (typeof result !== 'object' || typeof result.then !== 'function') {
        spec.fail('`it` block returns non-promise: ' + result);
        onComplete();
    } else {
        result.then(function (value) {
            if (value !== undefined) {
                spec.fail('Promise fulfilled with unexpected value: ' + value);
            }
            onComplete();
        }, function (error) {
            spec.fail(error);
            onComplete();
        });
    }
};

