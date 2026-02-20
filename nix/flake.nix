{
  description = "throwparty/kickstart";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/release-25.11";
    throw-party = {
      url = "git+ssh://git@github.com/throwparty/nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      flake-utils,
      nixpkgs,
      throw-party,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        lib = pkgs.lib // throw-party.lib;
        inherit (pkgs.lib) getExe;
      in
      rec {
        devShells.default =
          let
            inherit (throw-party.devShells.${system}) commonTools;
            inherit (pkgs)
              bun
              just
              mdformat
              nixfmt
              prettier
              toml-sort
              treefmt
              ;
            toolVersions = throw-party.lib.mkToolVersions {
              inherit pkgs;
              name = "default";
              commands = ''
                printf "bun %s\n" "$(${getExe bun} --version)"
                ${getExe just} --version
                ${getExe mdformat} --version
                ${getExe nixfmt} --version
                printf "prettier %s\n" "$(${getExe prettier} --version)"
                ${getExe toml-sort} --version
                ${getExe treefmt} --version
              '';
            };
          in
          pkgs.mkShell {
            nativeBuildInputs = [
              bun
              just
              mdformat
              nixfmt
              prettier
              toml-sort
              treefmt
            ];
            shellHook = "\ncat ${toolVersions}";
          };
      }
    );
}
