#!/bin/sh -

echo "ニニニニニニニニニ＞ Installing node.jS ＜ニニニニニニニニニ"
brew install node

echo "==> Installing Coaopods"
brew install cocoapods

echo "install yarn"
npm install --global yarn

echo "--> Moving into parent directory"
cd../..

echo "==> Installing node modules:"
yarn

echo "Redirecting to /ios directory"
cd ios

echo "--> Install dependencies you manage with CocoaPods."
pod install
