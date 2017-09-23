import chai, {expect} from "chai";
import dirtyChai from "dirty-chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import "sinon-as-promised";
import "sinon-mongoose";
import {it, afterEach, beforeEach, after, before} from "arrow-mocha/es5";
import _debug from "debug";

const debug = _debug('contentModule:test');
chai.use(chaiAsPromised);
chai.use(dirtyChai);

describe('Base module', () => {
  it('passes');
});