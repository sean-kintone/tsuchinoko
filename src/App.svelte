<script lang="ts">
  import "./tailwind.css";
  import Spinner from "./components/spinner.svelte";
  import { CheckCircleSolid, CloseCircleSolid } from "flowbite-svelte-icons";
  import { Input, Button } from "flowbite-svelte";
  import { onMount } from "svelte";

  let message = "";
  let loading = false;
  let success = false;
  let error = false;

  // Helper function to get localized strings
  function getLocalizedString(key: string): string {
    return chrome.i18n.getMessage(key) || key;
  }

  onMount(() => {
    // Initialize the message with the localized string
    message = getLocalizedString("HELLO");
  });

  function sendHelloWorld() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "helloWorld" },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else if (response && response.success) {
              console.log("Message sent successfully");
            }
          },
        );
      } else {
        console.error("No active tab found");
      }
    });
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/build/bundle.css" />
</svelte:head>

<main class="text-base flex flex-col items-center p-14 m-5 w-72 justify-around">
  <div class="text-red-500 size-10 m-3">{message}</div>
  <Button on:click={sendHelloWorld}>Say Hello World</Button>
</main>
