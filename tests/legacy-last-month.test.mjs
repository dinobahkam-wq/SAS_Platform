import test from 'node:test';
import assert from 'node:assert/strict';
import {selectMonth} from '../scripts/legacy-last-month.mjs';
const row=(date)=>({published_local:date,title:'تجريبي'});
test('selects October 11 through November 11 inclusive',()=>{
 const out=selectMonth({source:'s',records:[row('2026-09-15T14:00:00'),row('2026-10-10T23:59:59'),row('2026-10-11T00:00:00'),row('2026-11-11T23:59:59'),row('2026-11-12T00:00:00')]});
 assert.equal(out.count,2);
});
test('rejects non-inventory input',()=>assert.throws(()=>selectMonth({posts:[]})));
