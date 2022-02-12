# cu-cli

A Simple Command line Utility to create tasks, subtask and comments in clickup

### Install

1. `> npm -i -g clickup-cli`
2. Copy sample.js to ~/.clickup
3. Edit `~/.clickup` with default and auth token from your clickup account
4. `> cu-cli help`

### Usage 
> cu-cli help

Usage: cu-cli [options] [command]

clickup cli

Options:
  -h, --help                             display help for command

Commands:
  task [options] <name> [desc]           create task
  comment [options] <task_id> [message]  add comment
  help [command]                         display help for command
```


### Create Task
```

Usage: clickup task [options] <name> [desc]

create task

Arguments:
  name                            Task Name
  desc                            Task Description

Options:
  -f, --file <filePath>           Markdown Description from file
  -t, --parent <task_id>          Parent Task Id
  -i, --priority <importance>     Task Priority (1-5)
  -a, --assignees <user...>       Comma seperated user initals or ids
  -e, --time_estimate <estimate>  Time Estimate (ms)
  -s, --status <status>           Task Status
  -p, --points <points>           Sprint Points
  -c, --custom <json>             Custom Fields as JSON
  -l, --list <list...>            comma seperated lists names or ids
  -h, --help                      display help for command
  ```
  
### Create Comment
```
Usage: clickup comment [options] <task_id> [message]

add comment

Arguments:
  task_id                   Task Id
  message                   Comment Text

Options:
  -f, --file <filePath>     Read from file
  -n, --notify_all          Notify all
  -a, --assignee <user_id>  Assign to user
  -h, --help                display help for command
```


### Create Comment


