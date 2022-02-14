#! /usr/bin/env node

import { Command } from 'commander'
import { promises as fs } from 'fs'
import os from 'os'
import capi from 'axios'

let config = {}
const capp = new Command()
capi.defaults.baseURL = 'https://api.clickup.com/api/v2/'
capp.name('cu-cli').description('clickup cli')

capp.option('-d, --debug').option('-c, --config', 'Configuration File', os.homedir() + '/.clickup')
  .hook('preAction', async (cmd) => {
    config = Object.assign({users:{}, lists:{}},JSON.parse(await fs.readFile(cmd.opts().config, 'utf8')))
    capi.defaults.headers.common['Authorization'] = config.auth
    config.debug = cmd.opts().debug 
    if (config.debug) console.log('CONFIG:', config)
  })

capp.command('create').description('create task')
  .argument('<name>', 'Task Name')
  .argument('[desc]', 'Task Description')
  .option('-f, --file <filePath>', 'Markdown Description from file')
  .option('-t, --parent <task_id>', 'Parent Task Id')
  .option('-i, --priority <priority>', 'Task Priority (1-5)')
  .option('-a, --assignees <user...>', 'Comma seperated user initals or ids')
  .option('-e, --time_estimate <estimate>', 'Time Estimate (ms)')
  .option('-s, --status <status>', 'Task Status')
  .option('-p, --points <points>', 'Sprint Points')
  .option('-j, --json <json>', 'Custom Fields as JSON')
  .option('-l, --list <list...>', 'comma seperated lists names or ids')
  .action(async (name, desc, opts) => {
    let data = merge(opts, { name: name, content: desc})
    if (opts.file) data.markdown_description = await fs.readFile(opts.file, 'utf8')
    if (config.debug) console.log('PAYLOAD:', data, opts)
    capi.post('list/'+ (opts.list || config.defaults.list) +'/task', data).then(log).catch(err)
  })

capp.command('update').description('update task')
  .argument('<task_id>', 'Task Id')
  .argument('[name]', 'Task Name')
  .argument('[desc]', 'Task Description')
  .option('-f, --file <filePath>', 'Markdown Description from file')
  .option('-t, --parent <task_id>', 'Parent Task Id')
  .option('-i, --priority <importance>', 'Task Priority (1-5)')
  .option('-a, --assignees <user...>', 'Comma seperated user initals or ids')
  .option('-e, --time_estimate <estimate>', 'Time Estimate (ms)')
  .option('-s, --status <status>', 'Task Status')
  .option('-p, --points <points>', 'Sprint Points')
  .option('-j, --json <json>', 'Custom Fields as JSON')
  .option('-l, --list <list...>', 'comma seperated lists names or ids')
  .action(async (tid, name, desc, opts) => {
    let data = merge(opts, { name: name, content: desc})
    if (opts.file) data.markdown_description = await fs.readFile(opts.file, 'utf8')
    capi.put('task/'+task_id, data).then(log).catch(err)
  })

capp.command('delete').description('delete task')
  .argument('<task_id>', 'Task Id')
  .action(async (tid, opts) => await capi.delete('task/'+tid).then(log).catch(err))

capp.command('comment')
  .description('add comment')
  .argument('<task_id>', 'Task Id')
  .argument('[message]', 'Comment Text')
  .option('-f, --file <filePath>', 'Read from file')
  .option('-n, --notify_all', 'Notify all')
  .option('-a, --assignee <user_id>', 'Assign to user')
  .action(async (tid, msg, opts) => {
    let data = merge(opts, { comment_text: msg })
    if (opts.file) data.comment_text = await fs.readFile(opts.file, 'utf8')
    capi.post('task/'+tid+'/comment', data).then(log).catch(err)
  })

capp.parse()

const err = (e) => console.log(e.response.status, e.response.data)
const log = (r) => console.log(config.debug ? r.data : r.data.id)

function merge(opts, extra={}) {
  if (opts.assignees) opts.assignees = opts.assignees.map(_ => config.users[_] || _)
  if (config.users[opts.assignee]) opts.assignee = config.users[opts.assignee]
  if (opts.lists) opts.lists = opts.lists.map(_ => config.lists[_] || _)
  if (config.lists[opts.list]) opts.list = config.lists[opts.list]
  return opts.json
    ? Object.assign(config.defaults, opts, JSON.parse(opts.json), extra)
    : Object.assign(config.defaults, opts, extra)
}
