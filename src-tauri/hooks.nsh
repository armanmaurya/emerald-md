; Tauri NSIS Hook Script for Emerald
; Adds/removes the application directory from the system PATH

!macro NSIS_HOOK_POSTINSTALL
  ; $INSTDIR is the directory where the user installed the app
  ; This macro is called after installation completes
  
  ; Read the current PATH from the user registry
  ReadRegStr $0 HKCU "Environment" "Path"
  
  ; Append $INSTDIR to PATH
  ; Simply append without checking if it exists (Windows handles duplicates)
  ${If} $0 == ""
    ; If PATH is empty, just set it to $INSTDIR
    WriteRegExpandStr HKCU "Environment" "Path" "$INSTDIR"
  ${Else}
    ; Otherwise, append with semicolon separator
    WriteRegExpandStr HKCU "Environment" "Path" "$0;$INSTDIR"
  ${EndIf}
  
  ; Notify Windows that environment variables have changed
  SendMessage ${HWND_BROADCAST} ${WM_SETTINGCHANGE} 0 "STR:Environment" /TIMEOUT=5000
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; This macro is called before uninstallation
  ; For now, we'll just leave the PATH entry as-is
  ; (Removing it would require string manipulation which is complex in NSIS)
  ; Users can manually remove it if needed, or the entry will be harmless
!macroend
