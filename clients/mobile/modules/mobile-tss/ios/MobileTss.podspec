Pod::Spec.new do |s|
  s.name           = 'MobileTss'
  s.version        = '1.0.0'
  s.summary        = 'Native Module to allow vultisig app to support GG20 TSS'
  s.description    = 'this module allow app to do keygen/keysign using old GG20 TSS library'
  s.author         = ''
  s.homepage       = 'https://vultisig.com'
  s.platforms      = {
    :ios => '15.1',
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.vendored_frameworks = 'Tss.xcframework'
  
  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{m,mm,swift,hpp,cpp}"
end
