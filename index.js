//require.extensions['.clickup'] = require.extensions['.js']

import { Command } from 'commander'
import clickup_api from 'clickup_api'
import { promises as fs } from 'fs'

let config = {}
let capi = null
const capp = new Command()

capp.name('cu-cli').description('clickup cli')

capp.option('-d, --debug').option('-c, --config', 'Custom Configuration File', '.clickup')
  .hook('preAction', async (cmd) => {
    config = JSON.parse(await fs.readFile(cmd.opts().config, 'utf8'))
    capi = new clickup_api(config.auth)
    console.log(config)
  })

capp.command('task').description('create task')
  .argument('<name>', 'Task Name')
  .argument('[desc]', 'Task Description')
  .option('-f, --file <filePath>', 'Markdown Description from file')
  .option('-t, --parent <task_id>', 'Parent Task Id')
  .option('-i, --priority <importance>', 'Task Priority (1-5)')
  .option('-a, --assignees <user...>', 'Comma seperated user initals or ids')
  .option('-e, --time_estimate <estimate>', 'Time Estimate (ms)')
  .option('-s, --status <status>', 'Task Status')
  .option('-p, --points <points>', 'Sprint Points')
  .option('-j, --custom <json>', 'Custom Fields as JSON')
  .option('-l, --list <list...>', 'comma seperated lists names or ids')
  .action(async (name, desc, opts) => {
    try {
      console.log("here1", opts)
      console.log("here2", config)
      let capi = new clickup_api(config.auth)
      //let data = merge(opts, { name: name, content: desc})
      let data = Object.assign(config.defaults, opts, { name: name, content: desc})
      if (opts.file) data.markdown_description = await fs.readFile(opts.file, 'utf8')
      console.log('TASK:', data)
      return await capi.Tasks.create_task(opts.list || config.defaults.list, data)
    } catch (e) { return e.toString() }
  })

capp.command('comment')
  .description('add comment')
  .argument('<task_id>', 'Task Id')
  .argument('[message]', 'Comment Text')
  .option('-f, --file <filePath>', 'Read from file')
  .option('-n, --notify_all', 'Notify all')
  .option('-a, --assignee <user_id>', 'Assign to user')
  .action(async (tid, msg, opts) => {
    try {
      let data = Object.assign(opts, { comment_text: msg })
      if (opts.file) data.comment_text = await fs.readFile(opts.file, 'utf8')
      return await capi.Comments.create_task_comment(tid, data) 
    } catch(e) { return e.toString() }
  })

capp.parse()

function merge(opts, extra={}) {
  if (opts.config) config = require(opts.config)  
  opts.assignees ??= opts.assignees.map(_ => config.users[_] || _)
  opts.lists ??= opts.lists.map(a => config.lists[_] || _)
  return opts.custom
    ? Object.assign(config.defaults, opts, JSON.parse(opts.custom), extra)
    : Object.assign(config.defaults, opts, extra)
}
