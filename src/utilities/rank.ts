import { UserInterface } from "../models/User";

function getRank(data: UserInterface) {
  if (data.membership?.isDeveloper) {
    return { title: "Developer", color: "#ff0000" };
  }
  if (data.membership?.isAdministrator) {
    return { title: "Administrator", color: "#ff0000" };
  }
  if (data.membership?.isModerator) {
    return { title: "Moderator", color: "#ff7f00" };
  }
  if (data.membership?.isContributor) {
    return { title: "Contributor", color: "#01acff" };
  }
  if (data.membership?.isTester) {
    return { title: "Tester", color: "#5bb1e0" };
  }
  if (data.membership?.isDonator) {
    return { title: "Donator", color: "#26e02c" };
  }
  // No rank
  return { title: "(No Rank)", color: "#eeeeee" };
}

export { getRank };
