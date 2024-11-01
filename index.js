#!/usr/bin/env node
import { program } from "commander";
import e from "express";
import fs from "fs";
import path from "path";
import axios from "axios";

program
  .version("1.0.0")
  .description("Wakeflow CLI to push the function code")
  .option("-n")
  .option("-l --token <token>", "Login to wakeflow")
  .action((options) => {
    if (options.token) {
      login(options);
    } else updateCode();
  });

function updateCode() {
  // read the token from the file

  try {
    const tokenFileContent = fs.readFileSync(path.join(process.env.HOME, ".wakeflow.json"), "utf8")
  }
  catch (error) {
    console.log("Token not found please login first");
    return;
  }
  const token = JSON.parse(tokenFileContent).token;

  if (!token) {
    console.log("You need to login first to push the code");
    return;
  }
  const files = fs
    .readdirSync(process.cwd())
    .filter((file) => file.endsWith(".js"));

  // get the file with https://run.wakeflow.io in it
  const wantedFiles = files.filter((file) => {
    console.log("file : ", file);
    const filePath = path.join(process.cwd(), file);
    const data = fs.readFileSync(filePath, "utf8");
    return data.includes("//" + " https://run.wakeflow.io") ? true : false;
  });

  if (!wantedFiles || (Array.isArray(wantedFiles) && wantedFiles.length === 0)) {
    console.log("No file found with https://run.wakeflow.io in it");
    return;
  }

  let payload = wantedFiles.map((wantedFile) => {
    const filePath = path.join(process.cwd(), wantedFile);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const appearanceIndex = fileContent.indexOf("https://run.wakeflow.io");
    const uniqueURL = fileContent.substring(
      appearanceIndex,
      fileContent.indexOf("\n", appearanceIndex)
    );
    const payload = {
      uniqueURL,
      token,
      fileContent,
    };
    console.log("payload : ", payload);
  });
  
}

function login(options) {
  if (options.token) {
    //  save to root user directory
    fs.writeFileSync(
      path.join(process.env.HOME, ".wakeflow.json"),
      JSON.stringify({ token: options.token })
    );
    console.log("Saved to ", path.join(process.env.HOME, ".wakeflow.json"));
  } else {
    // redirect to login page
    console.log(
      "Please get your token from https://tokens.wakeflow.io/ and pass it with this command wakeflow --login <token>"
    );
  }
}

program.parse(process.argv);
