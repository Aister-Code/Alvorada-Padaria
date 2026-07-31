import { fail, pass, stagedFiles } from "./lib.mjs";

const staged = stagedFiles();

if (staged.length) {
  fail("staging is not empty", staged);
}

pass("staging is empty");
