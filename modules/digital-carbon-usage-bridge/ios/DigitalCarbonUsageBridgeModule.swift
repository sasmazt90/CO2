import ExpoModulesCore

public class DigitalCarbonUsageBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DigitalCarbonUsageBridge")

    Function("getBridgeStatus") {
      return [
        "moduleName": "DigitalCarbonUsageBridge",
        "platform": "ios",
        "installed": true,
        "supportsDeviceWideUsage": false,
        "accessGranted": false,
        "requiresManualAccess": false,
        "canOpenSettings": false,
        "note": "iOS does not expose device-wide app usage history to this app surface, so the app stays on local fallbacks here.",
        "supportedMetrics": []
      ]
    }

    AsyncFunction("getTodayUsageSnapshot") { () -> [String: Any]? in
      return nil
    }

    AsyncFunction("openUsageAccessSettings") { () -> Bool in
      return false
    }
  }
}
