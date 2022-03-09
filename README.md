# cu-cli

A Simple Command line Utility to create tasks, subtask and comments in clickup

### Install

1. `> npm -i -g clickup-cli`
2. `>cp ./config.json ~/.clickup`
3. Edit `~/.clickup` to include approprioate defaults and auth token from your clickup account
4. `> cu help`

### Usage 

```
> clickup help
Usage: cu-cli [options] [command]

clickup cli

Options:
  -d, --debug
  -c, --config                              Configuration File
  -h, --help                                display help for command

Commands:
  create [options] <name> [desc]            create task
  update [options] <task_id> [name] [desc]  update task
  delete <task_id>                          delete task
  comment [options] <task_id> [message]     add comment
  list [options] <task_id> [name]        add checklist
  item [options] <list_id> <item>        add checklist item
  help [command]                            display help for command
```


### Create Task
```
> clickup help create

Usage: clickup create [options] <name>

create task

Arguments:
  name                            Task Name

Options:
  -f, --file <filePath>           Markdown Description from file
  -t, --parent <task_id>          Parent Task Id
  -i, --priority <priority>       Task Priority (1-5)
  -a, --assignees <user...>       Comma seperated user initals or ids
  -e, --time_estimate <estimate>  Time Estimate (ms)
  -s, --status <status>           Task Status
  -p, --points <points>           Sprint Points
  -j, --json <json>               Custom Fields as JSON
  -l, --list <list...>            comma seperated lists names or ids
  -m, --description <markdown>    Markdown description
  -h, --help                      display help for command  ```
```

### Update Task
```
> clickup help update

Usage: clup update [options] <task_id> [name]

update task

Arguments:
  task_id                         Task Id
  name                            Task Name

Options:
  -f, --file <filePath>           Markdown Description from file
  -t, --parent <task_id>          Parent Task Id
  -i, --priority <importance>     Task Priority (1-5)
  -a, --assignees <user...>       Comma seperated user initals or ids
  -e, --time_estimate <estimate>  Time Estimate (ms)
  -s, --status <status>           Task Status
  -p, --points <points>           Sprint Points
  -j, --json <json>               Custom Fields as JSON
  -l, --list <list...>            comma seperated lists names or ids
  -m, --description <markdown>    Markdown description
  -h, --help                      display help for command
```

### Delete Task
```
> clickup help delete

Usage: cu-cli delete [options] <task_id>

delete task

Arguments:
  task_id     Task Id

Options:
  -h, --help  display help for command
```


### Add Comment

```
> clickup help comment

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

### Create Checklist 

```
> clickup help check [options] <task_id> [item]

add checklist

Arguments:
  task_id                Task Id
  item                   Checklist Item

Options:
  -f, --file <filePath>  List of Items
  -n, --name <name>      Checklist Name (default: "Checklist")
  -h, --help             display help for command

```

