{ pkgs ? import <nixpkgs> {} }:
let
  lib = pkgs.lib;
  hasuraAvailable = pkgs ? hasura-cli;

  dbUp = pkgs.writeShellScriptBin "db-up" ''
    exec "$PROJECT_ROOT/scripts/database/db-up.sh" "$@"
  '';

  dbDown = pkgs.writeShellScriptBin "db-down" ''
    exec "$PROJECT_ROOT/scripts/database/db-down.sh" "$@"
  '';
in
pkgs.mkShell {
  packages =
    with pkgs;
    [
      git
      deno
      nodejs_22
      curl
      jq
      dbUp
      dbDown
    ]
    ++ lib.optional hasuraAvailable hasura-cli;

  shellHook = ''
    export PROJECT_ROOT="$PWD"
    export DENO_DIR="$PWD/.deno"
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';
}
