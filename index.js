#! /usr/bin/env node

import { Command } from 'commander'
import fs from 'fs'
import os from 'os'
import capi from 'axios'

capi.defaults.baseURL = 'https://api.clickup.com/api/v2/'
const err =  (e) => console.log(e.response.status, e.response.data)
const log =  (r) => console.log(config.debug ? r.data : r.data.id)
const read = (f) => fs.readFileSync(f,'utf8').replace(/\`/g,'\`')

const capp = new Command()
let config = {}

function merge(opts, extra={}, fileProp) {
  if (opts.assignees) opts.assignees = opts.assignees.map(_ => config.users[_] || _)
  if (config.users[opts.assignee]) opts.assignee = config.users[opts.assignee]
  if (opts.lists) opts.lists = opts.lists.map(_ => config.lists[_] || _)
  if (config.lists[opts.list]) opts.list = config.lists[opts.list]
  if (fileProp && opts.file) opts[fileProp] = read(opts.file)
  return Object.assign(config.defaults, opts, extra, opts.json && JSON.parse(opts.json))
}

const taskCmd = (app, name, desc) => app.command(name).description(desc)
  .option('-f, --file <filePath>', 'Markdown Description from file')
  .option('-t, --parent <task_id>', 'Parent Task Id')
  .option('-i, --priority <priority>', 'Task Priority (1-5)')
  .option('-a, --assignees <user...>', 'Comma seperated user initals or ids')
  .option('-e, --time_estimate <estimate>', 'Time Estimate (ms)')
  .option('-s, --status <status>', 'Task Status')
  .option('-p, --points <points>', 'Sprint Points')
  .option('-n, --name <name>', 'Task Name')
  .option('-j, --json <json>', 'Custom Fields as JSON')
  .option('-d, --description <description>', 'Task Description')
  .option('-l, --list <list...>', 'comma seperated lists names or ids')

capp.name('clickup').description('clickup cli (v1.0.18)')
  .option('-v, --verbose').option('-c, --config', 'Configuration File', os.homedir() + '/.clickup')
  .hook('preAction', (cmd) => {
    config = Object.assign({users:{}, lists:{}}, JSON.parse(read(cmd.opts().config)))
    capi.defaults.headers.common['Authorization'] = config.auth
    config.debug = cmd.opts().verbose
    if (config.debug) console.log('CONFIG:', config)
  })

taskCmd(capp, 'create', 'Create task')
  .argument('<name>', 'Task Name')
  .action((name, opts) => {
    let data = merge(opts, { name: name }, 'markdown_description')
    capi.post('list/'+ (opts.list || config.defaults.list) +'/task', data).then(log).catch(err)
  })

taskCmd(capp, 'update', 'Update Task')
  .argument('<task_id>', 'Task Id')
  .argument('[name]', 'Task Name')
  .action((tid, name, opts) => {
    let data = merge(opts, { name: name }, 'markdown_description')
    capi.put('task/'+tid, data).then(log).catch(err)
  })

capp.command('delete').description('Delete task')
  .argument('<task_id>', 'Task Id')
  .action((tid, opts) => capi.delete('task/'+tid).then(log).catch(err))

capp.command('comment').description('add comment')
  .argument('<task_id>', 'Task Id')
  .argument('[message]', 'Comment Text')
  .option('-f, --file <filePath>', 'Read from file')
  .option('-n, --notify_all', 'Notify all')
  .option('-a, --assignee <user_id>', 'Assign to user')
  .action((tid, text, opts) => {
    let data = merge(opts, { comment_text: text }, 'comment_text')
    capi.post('task/'+tid+'/comment', data).then(log).catch(err)
  })

capp.command('check').description('add checklist')
  .argument('<task_id>', 'Task Id')
  .argument('[item]', 'Checklist Item')
  .option('-f, --file <filePath>', 'List of Items')
  .option('-n, --name <name>', 'Checklist Name', 'Checklist')
  .action(async (tid, item, opts) =>  {
    try { 
      let cid = (await capi.get('task/'+tid)).data.checklists.find(_ => _.name=opts.name)?.id 
      cid = cid || (await capi.post('task/'+tid+'/checklist', {name: opts.name})).data.checklist.id
      if (opts.file) for (let i of read(opts.file).split(/\n/)) {
        capi.post('checklist/'+cid+'/checklist_item', {name: i}).then(log).catch(err)
      } else capi.post('checklist/'+cid+'/checklist_item', {name: item}).then(log).catch(err) 
    } catch (e) { err(e) }
  })

capp.parse()

