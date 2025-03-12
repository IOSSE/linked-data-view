#!/bin/bash
podman run -d --name apache-container -p 8080:80 --replace -v $(pwd)/../public:/var/www/html:Z php8-apache

