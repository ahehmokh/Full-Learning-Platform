@echo off
chcp 65001 > nul

set "filename=temp_code.cpp"
set "output_filename=temp_code.exe"
set "opencv_include=C:\opencv\build\include"
set "opencv_lib=C:\opencv\build\x64\vc16\lib"
set "compile_errors_file=compile_errors.txt"
set "runtime_errors_file=runtime_errors.txt"
set "output_file=output.txt"

g++ "%filename%" -o "%output_filename%" -I"%opencv_include%" -L"%opencv_lib%" -lopencv_world470d 2> "%compile_errors_file%"

if %errorlevel% equ 0 (
    "%output_filename%" > "%output_file%" 2> "%runtime_errors_file%"
    set "output_var="
    for /f "delims=" %%i in ("%output_file%") do set "output_var=%%i"
    set "runtime_errors_var="
    for /f "delims=" %%i in ("%runtime_errors_file%") do set "runtime_errors_var=%%i"
    set "compile_errors_var="
) else (
    set "output_var="
    set "runtime_errors_var="
    set "compile_errors_var="
    for /f "delims=" %%i in ("%compile_errors_file%") do set "compile_errors_var=%%i"
)

echo {
echo   "output": "%output_var%",
echo   "compile_errors": "%compile_errors_var%",
echo   "runtime_errors": "%runtime_errors_var%"
echo }