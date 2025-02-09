Pod::Spec.new do |s|
  s.name           = 'MobileTss'
  s.version        = '1.0.0'
  s.summary        = 'Native Module to allow vultisig app to support GG20 TSS'
  s.description    = 'A sample project description'
  s.author         = ''
  s.homepage       = 'https://vultisig.com'
  s.platforms      = {
    :ios => '15.1',
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
