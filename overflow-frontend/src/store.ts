import { reactive } from "vue";

const state = reactive({
  /**
   * The name of the current user that will be displayed
   * @type string
   */
  displayName: "",
  /**
   * The code of the lobby the current user is in
   * @type string
   */
  lobbyCode: "",
});

export default { state };