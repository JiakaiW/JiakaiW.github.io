---
layout: default
title: Using Docker w/ HTCondor
permalink: /tech-docs/using_docker_with_HTCondor
---

<style>
main {
    position: relative;
    z-index: 1;
    padding: 2em;
    max-width: none !important;
    width: 100%;
    margin: 0;
    min-height: calc(100vh - 200px);
    background: transparent !important;
}

.dropdown-content a,
.dark-mode .dropdown-content a {
    color: white !important;
}

main > * {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
    /* Remove white text color - let it use default theme colors */
    /* color: white; */
    /* Add left alignment */
    text-align: left;
}

main h1 {
    font-size: 2em;
    margin-top: 1.5em;
    margin-bottom: 1em;
    text-align: left;
}

main p {
    margin-bottom: 1em;
    line-height: 1.6;
    text-align: left;
}

main a {
    color: var(--color-primary);
    text-decoration: none;
}

main a:hover {
    text-decoration: underline;
}

/* Add hover area for dropdown */
.menu-link {
    padding-bottom: 20px;
}

pre, code {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    overflow-x: auto;
}
</style>

# Using docker in HTCondor

We use HTCondor when we do stochastic schrödinger equation (monte carlo solve in qutip)/ GPU jobs / parameter sweep. This tutorial contains 2 parts: 

1) Creating a docker container
2) Using the docker container in HTCondor

## Creating docker container

### 1. creating docker hub account

[Docker Hub](https://hub.docker.com/)

### 2. Installing docker plugin to VSCode/Cursor:

![Docker VSCode Extension](/tech-docs/files/docker_plugin.png)

### 3. Install docker desktop, open it and keep it running
[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

### 4. Create a Dockerfile that contain what you need in HTCondor job nodes

Here's the example Dockerfile I used to install my package:
[https://github.com/JiakaiW/CoupledQuantumSystems/blob/main/Dockerfile](https://github.com/JiakaiW/CoupledQuantumSystems/blob/main/Dockerfile)

### 5. Build the image and push it to docker hub

In command line, run something like:
```bash
docker build -t name_of_image:name_of_tag .
```

Then in VScode, open the Docker plugin, (log in to your docker account if needed), then push it to docker hub


# Using the docker container in HTCondor


### Use VSCode to connect
(I recommand using VScode "connect to host" feature rather than connect to HTCondor using a terminal)
![VSCode-SSH](/tech-docs/files/vs_code_ssh.png)

### Use container in submit file

This is my example submit file. The container_image contains the packages I need to use, and the specific task I want to do is contained in script.py. 
```submitfile
container_image = docker://jiakaiw/coupledquantumsystems:v18
universe = container

log = darken_$(Cluster).log
error = darken_$(Process).err
# output = result_$(Process).zip

executable = shell.sh
arguments = $(Process)

should_transfer_files = YES
when_to_transfer_output = ON_EXIT
transfer_input_files = script.py

request_cpus = 3
request_memory = 6GB
request_disk = 3GB

queue 2601
```

My shell.sh is just a wrapper around python script:
```shell
python script.py $1
```