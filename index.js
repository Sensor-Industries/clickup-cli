#! /usr/bin/env node

import { Command } from 'commander'
import fs from 'fs'
import os from 'os'
import capi from 'axios'

capi.defaults.baseURL = 'https://api.clickup.com/api/v2/'
const err =  (e) => console.log(e.response.status, e.response.data)
const log =  (r) => console.log(config.debug ? r.data : r.data.id)
const capp = new Command()
let config = {}

const taskCmd = (app, name, desc) => app.command(name).description(desc)
  .option('-f, --file <filePath>', 'Markdown Description from file')
  .option('-t, --parent <task_id>', 'Parent Task Id')
  .option('-i, --priority <priority>', 'Task Priority (1-5)')
  .option('-a, --assignees <user...>', 'Comma seperated user initals or ids')
  .option('-e, --time_estimate <estimate>', 'Time Estimate (ms)')
  .option('-s, --status <status>', 'Task Status')
  .option('-p, --points <points>', 'Sprint Points')
  .option('-j, --json <json>', 'Custom Fields as JSON')
  .option('-m, --content <markdown>', 'Task Description')
  .option('-l, --list <list...>', 'comma seperated lists names or ids')

capp.name('cu-cli').description('clickup cli')
  .option('-d, --debug').option('-c, --config', 'Configuration File', os.homedir() + '/.clickup')
  .hook('preAction', (cmd) => {
    config = Object.assign({users:{}, lists:{}}, JSON.parse(read(cmd.opts().config)))
    capi.defaults.headers.common['Authorization'] = config.auth
    config.debug = cmd.opts().debug
    if (config.debug) console.log('CONFIG:', config)
  })

taskCmd(capp, 'create', 'Create task').argument('<name>', 'Task Name')
  .action((name, opts) => {
    let data = merge(opts, { name: name }, 'markdown_description')
    capi.post('list/'+ (opts.list || config.defaults.list) +'/task', data).then(log).catch(err)
  })

taskCmd(capp, 'update', 'Update Task').argument('<task_id>', 'Task Id').argument('[name]', 'Task Name')
  .action((tid, name, opts) => {
    let data = merge(opts, { name: name }, 'markdown_description')
    capi.put('task/'+tid, data).then(log).catch(err)
  })

capp.command('delete').description('Delete task').argument('<task_id>', 'Task Id')
  .action((tid, opts) => capi.delete('task/'+tid).then(log).catch(err))

capp.command('comment').description('Add Comment').argument('<task_id>', 'Task Id').argument('[text]', 'Comment Text')
  .option('-f, --file <filePath>', 'Read from file')
  .option('-n, --notify_all', 'Notify all')
  .option('-a, --assignee <user_id>', 'Assign to user')
  .action((tid, text, opts) => {
    let data = merge(opts, { comment_text: text }, 'comment_text')
    capi.post('task/'+tid+'/comment', data).then(log).catch(err)
  })

capp.parse()

function merge(opts, extra={}, fileProp) {
  if (opts.assignees) opts.assignees = opts.assignees.map(_ => config.users[_] || _)
  if (config.users[opts.assignee]) opts.assignee = config.users[opts.assignee]
  if (opts.lists) opts.lists = opts.lists.map(_ => config.lists[_] || _)
  if (config.lists[opts.list]) opts.list = config.lists[opts.list]
  if (fileProp && opts.file) opts[fileProp] = fs.readFileSync(opts.file,'utf8').replace(/\`/g,'\`')
  return Object.assign(config.defaults, opts, extra, opts.json && JSON.parse(opts.json))
}
