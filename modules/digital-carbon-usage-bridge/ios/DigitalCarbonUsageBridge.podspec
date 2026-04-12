Pod::Spec.new do |s|
  s.name           = 'DigitalCarbonUsageBridge'
  s.version        = '1.0.0'
  s.summary        = 'Native app usage bridge for Digital Carbon Footprint Score'
  s.description    = 'Local Expo module that exposes app-usage bridge status and Android Usage Access handoff for the shared carbon score engine.'
  s.author         = 'OpenAI Codex'
  s.homepage       = 'https://github.com/sasmazt90/CO2'
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.source         = { git: 'https://github.com/sasmazt90/CO2.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
