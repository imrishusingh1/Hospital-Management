const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'frontend/src/pages/admin/EditUserModal.jsx');
let s = fs.readFileSync(p, 'utf8');

const insert = `
                <div className="md:col-span-2 space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={profile.isAvailable !== false}
                      onChange={(e) => setField('isAvailable', e.target.checked)}
                    />
                    Present and accepting appointments
                  </label>
                  <p className="text-sm font-semibold text-slate-700">Available days</p>
                  <motion.div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={\`px-3 py-1.5 rounded-full text-xs font-semibold border \${
                          (profile.availableDays || []).includes(day)
                            ? 'bg-[#1db1d7] text-white border-[#1db1d7]'
                            : 'bg-white border-gray-200'
                        }\`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </motion.div>
                </motion.div>`;

const bad = 'motion' + '.div';
let block = insert.split(bad).join('div');

const needle = `                  <textarea className="w-full border border-gray-200 rounded-xl px-4 py-2" rows={3} value={profile.bio || ''} onChange={(e) => setField('bio', e.target.value)} />
                </motion.div>
              </motion.div>
            )}

            {user.role === 'Patient' && (`;

let needleFixed = needle.split(bad).join('motion.div');
needleFixed = needle.split('motion.div').join('div');

if (!s.includes(needleFixed)) {
  console.error('needle not found');
  process.exit(1);
}

s = s.replace(needleFixed, needleFixed.replace(
  `                </motion.div>
              </motion.div>
            )}

            {user.role === 'Patient' && (`,
  `                </motion.div>${block}
              </motion.div>
            )}

            {user.role === 'Patient' && (`
).split('motion.div').join('div'));

fs.writeFileSync(p, s);
console.log('ok');
