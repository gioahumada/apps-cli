import assert from "node:assert/strict";
import test from "node:test";
import { parseSource } from "../src/commands/install.js";
import { isValidName } from "../src/store.js";

test("validates app names", () => {
  assert.equal(isValidName("my-app_1.0"), true);
  assert.equal(isValidName("../escape"), false);
  assert.equal(isValidName("two words"), false);
});

test("parses GitHub shorthand", () => {
  assert.deepEqual(parseSource("user/my-app"), {
    url: "https://github.com/user/my-app.git",
    name: "my-app",
  });
});

test("rejects invalid install sources", () => {
  assert.equal(parseSource(""), null);
  assert.equal(parseSource("https://github.com/user/.."), null);
});
