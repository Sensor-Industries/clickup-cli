
const tasks = [
  { id: 0, name: 'task0', team: 'team1', effort: 1, impact: 3, focus: 1, deps: [7] },
  { id: 1, name: 'task1', team: 'team1', effort: 1, impact: 3, focus: 1, deps: [5] },
  { id: 2, name: 'task2', team: 'team1', effort: 2, impact: 3, focus: 2, deps: [1] },
  { id: 3, name: 'task3', team: 'team1', effort: 3, impact: 5, focus: 3, deps: []  },
  { id: 4, name: 'task4', team: 'team2', effort: 4, impact: 2, focus: 3, deps: [3, 1] },
  { id: 5, name: 'task5', team: 'team2', effort: 4, impact: 5, focus: 3, deps: [3] },
  { id: 6, name: 'task6', team: 'team2', effort: 2, impact: 2, focus: 4, deps: [4] },
  { id: 7, name: 'task7', team: 'team3', effort: 2, impact: 2, focus: 4, deps: [6] },
  { id: 8, name: 'task8', team: 'team3', effort: 2, impact: 2, focus: 4, deps: [7] },
]
const VELOCITY = 1

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}

function  score(_tasks, start = new Date()) {
  let tasks = Object.values(_tasks)
  tasks.map(t => {
    t.blocks = new Set()
    t.value = Math.round((2 ** t.impact) + ((2 ** t.impact) / (2 ** t.effort)))
    t.score = t.value/2
  })

  tasks.map(t1 => tasks.map(t2 => {
    if (t2.deps.includes(t1.id)) t1.blocks.add(t2.id)
  }))
  
  tasks.map(t1 => tasks.map(t2 => {
    if (t2.deps.includes(t1.id)) t2.blocks.forEach(_ => t1.blocks.add(_))
  }))

  tasks.map(t1 => t1.blocks.forEach(id => {
    _tasks[id].blocks.forEach(_ => t1.blocks.add(_))
  }))
 
  tasks.map(t1 => t1.blocks.forEach(id => {
    //console.log(t1, 'blocking', id)
    t1.score +=  Math.sqrt(_tasks[id].value)
  }))
  return _tasks
}

function schedule(tasks, start=new Date()) {
  let sorted = Object.values(tasks).sort((a,b) => b.score - a.score)
  let dates = {}
  let speed = {}
  for(let t of sorted) {
    dates[t.team] ??= start
    speed[t.team] ??= 2
    t.start = dates[t.team]
    for (let d of t.deps) if (t.start < tasks[d].close) t.start = tasks[d].close
    t.score = Math.round(t.score)
    t.days = 5 * (2 ** (t.effort+1)) / speed[t.team]
    t.close = dates[t.team] = t.start.addDays(t.days)
  }
  return sorted
}

//console.log(scheduleblocks(tasks))
const FIELD = { 
  COMPONENT: 'af1d6d74-cc25-4b37-b9ac-aca9495bae08'
}
let list = '174278045'
let team = '36066769'
let auth = 'pk_48135946_WQ0TLZJI0OCO5DVLEGUO56ESBUT3VOEJ'
let query = 'statuses[]=backlog&statuses[]=in+progress'
let root = 'https://api.clickup.com/api/v2/'

const axios = require('axios').default

axios.defaults.headers.common['Authorization'] = auth

async function getTasks(lid, states=['backlog', 'in progress'])  {
  let url = root+'/list/'+lid+'/task?'
  for (s of states) url += '&statuses[]='+s
  return (await axios.get(url)).data.tasks
}

async function updateTask(tid, body) { 
  return (await axios.put(root+'/task/'+tid, body)).data
}

async function updateField(tid, fid, value) { 
  return (await axios.post(root+'/task/'+tid+'/field/'+fid, { value: value } )).data
}

async function main() {
  let projects = await getTasks(174278045)
  let tasks = {}
  projects.forEach(p => tasks[p.id] = {
    id: p.id,
    name: p.name,
    team: (p.assignees[0]||{}).username,
    estimate: p.time_estimate,
    impact: parseInt(p.custom_fields.find(_ => _.name == 'Value').value),
    effort: parseInt(p.custom_fields.find(_ => _.name == 'Effort').value),
    status: p.status.status,
    blocks: [],
    deps: p.dependencies.map(d => d.depends_on),
  })
  let list = schedule(score(tasks))
  console.log(list)
  for (let t of list) {
    /*
    await updateTask(t.id, {
      start_date: t.start.getTime(), due_date: t.close.getTime(), 
      time_estimate: t.days * 6 * 60 * 60 * 1000
   })
   */
    await updateField(t.id, FIELD.COMPONENT, 10)
  }
}



main()





