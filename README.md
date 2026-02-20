# OpenCode session title plugin

Lets you set OpenCode session names.

______________________________________________________________________

## What's here

An OpenCode plugin for setting the session title. Provides a tool and a handler:

- `setsessiontitle` tool updates the session title to the provided value.
- A handler for `session.idle` does this every `updateFreq` idle events, ensuring the title is kept up to date over the session's lifetime.

## Getting set up

Install the plugin with the following in your `opencode.jsonc`:

```jsonc
{
  // snip
  "plugin": [
    // snip
    "@throwparty/opencode-plugin-session-title",
    // snip
  ],
  // snip
}
```

Optionally, write a configuration file named `session-title.jsonc` in the same directory:

```jsonc
{
  // Update the session on every prompt.
  // With an updateFreq of 1, the plugin will run every two idle events, since
  // the plugin's own prompts will trigger idle events.
  "updateFreq": 1,

  // Customise the prompt used for the summarisation.
  // You probably ought to specify a language here, else some models will
  // default to Mandarin, given its density per character. The default is
  // below.
  "prompt": "You are a summarisation bot. Generate a brief (max 50 character) title for this session. Omit low-signal language (e.g. for, the, with).",
}
```

Projects can ship their own configuration at `.opencode/session-title.jsonc`.
