#!/usr/bin/env bash
#
# This script assumes a linux environment

# ***** Update the extension path to your own ***
# ***** replace <user>. By default the path is for Windows ***
extension="C:\Users\<user>\AppData\Roaming\Adobe\CEP\extensions"
cwd=$(pwd)

echo "Building..."

npm run dev:cep

cd $extension

mkdir -p wakatime-adobe

cd $cwd

cp -a dist/. "${extension}/wakatime-adobe"

cd $cwd

echo "Done"
