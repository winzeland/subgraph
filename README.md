# Winzeland Subgraph

```bash
cp docker-compose.template.yml docker-compose.yml

yarn install
yarn create-local
yarn dev
```

OpenZeppelin supported contracts can be auto generated by updating `config/zeppelin.json`, running `yarn zeppelin` and copying contents from `generated/zeppelin.schema.graphql` and `generated/zeppelin.subgraph.graphql` to your `schema.graphql` and `subgraph.template.yaml`.
Make sure to verify there is no duplicates and paths of abi and mapping files are relative to your configs (generated files are relative to /generated folder and not project root).

