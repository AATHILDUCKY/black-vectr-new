---
title: "CloudBreak — Cloud Attack Paths"
date: 2026-04-28
author: "BLACK VECTR Engineering"
tags: cloud, aws, graph
status: Active
role: Research & Engineering
stack: Python, Neo4j, boto3
excerpt: "Graph-based analysis of IAM and network relationships to reveal exploitable privilege-escalation paths in AWS."
---

CloudBreak ingests an AWS account's IAM policies, resource relationships, and network configuration into a graph database, then queries for the paths an attacker would actually walk to reach crown-jewel resources.

## Overview

Principals, roles, resources, and policies become nodes; permissions and trust relationships become edges. Privilege escalation is then just a shortest-path query.

```python
import boto3

def collect_roles(session: boto3.Session):
    iam = session.client("iam")
    paginator = iam.get_paginator("list_roles")
    for page in paginator.paginate():
        for role in page["Roles"]:
            yield {
                "arn": role["Arn"],
                "trust": role["AssumeRolePolicyDocument"],
            }
```

> [!IMPORTANT]
> The most dangerous cloud vulnerabilities are rarely single misconfigurations — they are chains of individually-reasonable permissions that combine into full compromise.

## Attack Path Queries

CloudBreak ships Cypher queries for classic escalations — iam:PassRole to a privileged service, sts:AssumeRole chains, and Lambda-to-admin pivots.

## Status & Roadmap

- [x] IAM + network ingestion
- [x] Escalation path queries
- [] GCP support
- [] Continuous drift detection
