+++
title = "Displaying the percentage of hosts completed during a rolling Ansible Deploy using serial"
date = "2020-10-02"
slug = "host-percentage"
tags = ["ansible"]
+++

Recently we were looking at enhancing our deployment pipeline so that we run validation checks between every batch that is upgraded. For our VM deployments in Ansible we normally have

```
serial: 10%
```

so that 10% of the fleet is operated on at once, this includes draining from a load balancer before we upgrade the node, and adding it back to the load balancer after.

With Ansible, it doesn't seem like there is any built-in way to get the host percentage, so here is a hacky solution for others who want to do something similar:

* Initialize a fact to an empty array:

If we put this in `pre_tasks:` you will need to keep in mind it is called on every batch, so you don't want to override it:

```yaml
    - name: Initialize completed_hosts
      set_fact:
        completed_hosts: "{{ hostvars['localhost']['completed_hosts'] | default('[]') }}"
      delegate_to: localhost
      delegate_facts: true
      run_once: true

```

Another option is initialize it in a play that runs before the play that is operating on hosts, in that case you can just initialize it to an empty array:

```yaml
    - name: Initialize completed_hosts
      set_fact:
        completed_hosts: []
```

* In post_tasks, append the current batch to completed_hosts:

```yaml

    - name: Appends to completed hosts
      set_fact:
        completed_hosts: "{{ hostvars['localhost']['completed_hosts'] + ansible_play_batch }}"
      delegate_to: localhost
      delegate_facts: true
```

* Calculate a percentage:

```yaml

    - name: Percentage complete
      debug:
        msg: "Percentage complete: {{ ((hostvars['localhost']['completed_hosts'] | length) / (ansible_play_hosts | length) * 100) | int }}%"
      run_once: true
      delegate_to: localhost
```

And here is an example test play:

```yaml
- name: test
  gather_facts: false
  hosts: some_host_group
  serial: '10%'
  pre_tasks:
    - debug:
        msg: drain
    - name: Initialize completed_hosts
      set_fact:
        completed_hosts: "{{ hostvars['localhost']['completed_hosts'] | default('[]') }}"
      delegate_to: localhost
      delegate_facts: true
      run_once: true
  tasks:
    - debug:
        msg: deploy
  post_tasks:
    - debug:
        msg: enable
    - name: Appends to completed hosts
      set_fact:
        completed_hosts: "{{ hostvars['localhost']['completed_hosts'] + ansible_play_batch }}"
      delegate_to: localhost
      delegate_facts: true
    - name: Display current batch
      debug:
        var: ansible_play_batch
      delegate_to: localhost
      run_once: true
    - name: Display completed hosts
      debug:
        msg: "Percentage complete: {{ ((hostvars['localhost']['completed_hosts'] | length) / (ansible_play_hosts | length) * 100) | int}}%"
      run_once: true
      delegate_to: localhost
```
